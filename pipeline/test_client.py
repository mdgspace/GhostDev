import os
import gradio as gr

os.chdir(os.getcwd())

selected_files = []

def save_files(files):
    global selected_files
    selected_files = files

    print(selected_files)

    return (f"{len(files)} file(s) saved!")

with gr.Blocks() as test_client:
    file_selector = gr.File(label="Select Files", file_types=["file"], file_count="multiple")
    save_button = gr.Button("Save")
    output = gr.Textbox(label="Status")

    save_button.click(save_files, inputs=file_selector, outputs=output)

test_client.launch()