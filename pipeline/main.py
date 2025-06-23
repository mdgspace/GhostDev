import json
import requests as api
from settings import Settings
import redis
settings = Settings()  

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
gitdiff = r.get('gitdiff')
def exctract_code_from_selected_files(selected_files):
    file_to_code_mapping = {}
    for file in selected_files:
        with open(file, "r") as f:
            file_to_code_mapping.update({
                f"{file.split('/')[-1]}" : f.read()
            })
    file_to_code_json = json.dumps(file_to_code_mapping, indent=4)
    
    return file_to_code_json

def generate_code_from_llm(code, file_to_code_json):
    context = {
        "current_code" : code,
        "context_files": file_to_code_json
    }

    prompt = f'''
        You are an exceptional code quality enhancer and expert debugger. Your task is to review user-submitted code and provide thoughtful, actionable suggestions for improvement. You have deep expertise in identifying bugs, enhancing readability, optimizing performance, and aligning code with best practices.

        🧠 Behavioral Expectation:

        Your core purpose is to refactor and improve the provided current_code. In addition to leveraging your own extensive knowledge, you should analyze the coding style and conventions used in the context_files. These context_files are provided exclusively to help you understand and maintain consistency with the user's typical coding style, structure, and logic. They are not to be used as a source for generating new code, functions, or specific implementations within your suggested improvements for current_code. Your goal is to suggest improvements that feel natural and non-intrusive within the user’s coding patterns, solely applied to the current_code.

        📥 Input Format:

        You will receive:
        current_code – A string containing the primary code snippet written by the user.
        context_files – A JSON object where:
        - Keys are filenames (e.g., "utils.py")
        - Values are the complete contents of those files.

        These context files may contain utility functions, constants, helpers, or other relevant modules that reflect the user’s typical style, structure, and logic.

        Please analyze the following input, which contains the user’s current code and supporting context files:
        {context}

        📤 Output Format:

        Your response must contain only the improved version of the current_code provided in the input.

        - Do not include any explanations, summaries, or additional commentary.
        - Return only the refactored code as a plain text block.
        - The suggested code should incorporate improvements while maintaining consistency with the coding style found in the context files.
        - If the code is already well-written, return the original current_code unchanged.
    '''

    try:
        payload = {
            "model": settings.LLM_MODEL,
            "prompt": prompt,
            "stream": False,
            "temperature": settings.LLM_TEMPERATURE,
            "top_p": settings.LLM_TOP_P,
            "top_k": settings.LLM_TOP_K,
        }
        
        result = api.post(settings.LLM_API_URL, json=payload, timeout=30)
        
        result.raise_for_status()
        
        response_json = result.json()
        response_text = response_json.get('response')
        
        if not response_text:
            print("Warning: Empty response received from LLM")
            
        return response_text
    except Exception as e:
        print(f"Unexpected error generating response: {str(e)}")
        return f"Error generating response: {str(e)}"
