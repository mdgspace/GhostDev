import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    LLM_API_URL = os.getenv('LLM_API_URL')
    LLM_MODEL = os.getenv('LLM_MODEL')
    LLM_TEMPERATURE = os.getenv('LLM_TEMPERATURE')
    LLM_TOP_P = os.getenv('LLM_TOP_P')         
    LLM_TOP_K = os.getenv('LLM_TOP_K')          