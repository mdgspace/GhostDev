import gradio as gr
from main import exctract_code_from_selected_files, generate_code_from_llm, profile_from_code

file_to_code_json = {}

def save_files(files):
    global file_to_code_json
    file_to_code_json = exctract_code_from_selected_files(files)
    return (f"{len(files)} file(s) saved!")

def process_user_input_code(code):
    global file_to_code_json
    return generate_code_from_llm(code, file_to_code_json)

def analyze_coding_behavior():
    global file_to_code_json
    return profile_from_code(file_to_code_json)


with gr.Blocks() as test_client:
    file_selector = gr.File(label="Select Files", file_types=["file"], file_count="multiple", height=165)
    file_save_button = gr.Button("Save")
    output = gr.Textbox(label="Status")
    
    with gr.Row():
        code_input = gr.Textbox(label="Write Code Here", lines=25, placeholder="Enter your code...")
        output_display = gr.Textbox(label="Output Display", lines=25, interactive=False)
    
    code_process_button = gr.Button("Process Code")

    code_analysis_display = gr.TextArea(label="LLM Analysis Result", interactive=False)
    analyze_button = gr.Button("Analyze")

    file_save_button.click(save_files, inputs=file_selector, outputs=output)
    code_process_button.click(process_user_input_code, inputs=code_input, outputs=output_display)
    analyze_button.click(analyze_coding_behavior, outputs=code_analysis_display)

test_client.launch(server_name="0.0.0.0", server_port=7860)