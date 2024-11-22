import dash
import dash_bootstrap_components as dbc
from dash import dcc, html, Input, Output, State
import fitz  # PyMuPDF
import base64
import io
import json
import logging
from PIL import Image
from openai import OpenAI
from pdf_to_text import clean_text_dict
from model import get_model_output

# Configure logging
logging.basicConfig(level=logging.DEBUG)

client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

def extract_text_from_all_pages(pdf_bytes):
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_dict = {}
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text = page.get_text()
        text_dict[page_num + 1] = text  # Page numbers are 1-based
    return text_dict

def pdf_to_images(pdf_bytes, zoom_x=2.0, zoom_y=2.0):
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    images = []
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        matrix = fitz.Matrix(zoom_x, zoom_y)  # Adjust zoom level for higher resolution
        pix = page.get_pixmap(matrix=matrix)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        images.append(base64.b64encode(buf.getvalue()).decode())
    return images

def generate_response(text):
    try:
        completion = client.chat.completions.create(
            model="lmstudio-ai/gemma-2b-it-GGUF",
            messages=[
                {"role": "system", "content": "You are a helpful assistant who will take the user text and provide more information about important points from the input."},
                {"role": "user", "content": text}
            ],
            temperature=0.7,
        )
        response = completion.choices[0].message.content
        logging.debug(f"Generated response: {response}")
    except Exception as e:
        response = f"An error occurred while generating the response: {e}"
        logging.error(response)
    return response

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP], suppress_callback_exceptions=True)

app.layout = dbc.Container([
    dcc.Store(id='json-response', storage_type='memory'),  # Store for the JSON response
    dcc.Store(id='pdf-images', storage_type='memory'),  # Store for PDF images
    dcc.Store(id='loading-state', storage_type='memory', data=False),  # Store for loading state
    dbc.Row(dbc.Col(html.H1("PDF Previewer", className="text-center my-4"))),
    dbc.Row(dbc.Col(dcc.Upload(
        id='upload-pdf',
        children=html.Div([
            'Drag and Drop or ',
            html.A('Select a PDF', style={'color': '#007bff'})
        ]),
        style={
            'width': '100%',
            'height': '60px',
            'lineHeight': '60px',
            'borderWidth': '1px',
            'borderStyle': 'dashed',
            'borderRadius': '5px',
            'textAlign': 'center',
            'margin': '10px'
        },
        multiple=False
    ))),
    dbc.Container(
        dbc.Row(
            [
                dbc.Col([
                    dbc.Row(dbc.Col(dbc.Spinner(
                        id='loading-output',
                        color="primary",
                        fullscreen=True,
                        children=html.Div(id='output-pdf')
                    ))),
                    dbc.Row([
                        dbc.Col(dbc.Button("Previous", id="prev-page", n_clicks=0, color="primary", className="mx-1")),
                        dbc.Col(dbc.Button("Next", id="next-page", n_clicks=0, color="primary", className="mx-1"))
                    ], justify="center"),
                ], md=6)
            ]
        )
    ),
    dbc.Row(dbc.Col(dbc.Spinner(
        id='loading-text',
        color="primary",
        fullscreen=True,
        children=html.Div(id='output-text')
    )))
], fluid=True)

@app.callback(
    [Output('json-response', 'data'), Output('pdf-images', 'data'), Output('loading-state', 'data', allow_duplicate=True)],
    [Input('upload-pdf', 'contents')],
    [State('upload-pdf', 'filename')],
    prevent_initial_call=True
)
def process_pdf(contents, filename):
    if contents is None:
        logging.debug("No file uploaded.")
        return None, None, False

    content_type, content_string = contents.split(',')
    decoded = base64.b64decode(content_string)

    # Extract images from the PDF
    images = pdf_to_images(decoded)
    
    # Extract text from the PDF
    text = extract_text_from_all_pages(decoded)
    clean_pages = clean_text_dict(text)

    # Get model response
    response = get_model_output(clean_pages)
    logging.debug(f"Response from model: {response}")
    
    try:
        response_json = json.loads(response)
        logging.debug(f"Response type after first load: {type(response_json)}")
        
        # If the response is still a string, load it again
        if isinstance(response_json, str):
            response_json = json.loads(response_json)
            logging.debug(f"Response type after second load: {type(response_json)}")
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {e}")
        response_json = {"error": "Invalid JSON response from the model"}
    
    return response_json, images, True

@app.callback(
    [Output('output-pdf', 'children'), Output('prev-page', 'disabled'), Output('next-page', 'disabled'), Output('output-text', 'children'), Output('loading-state', 'data', allow_duplicate=True)],
    [Input('json-response', 'data'), Input('pdf-images', 'data'), Input('prev-page', 'n_clicks'), Input('next-page', 'n_clicks')],
    [State('loading-state', 'data')],
    prevent_initial_call=True
)
def update_output(response_json, images, prev_clicks, next_clicks, loading_state):
    if response_json is None or images is None:
        logging.debug("No data to display.")
        return html.Div("No file uploaded."), True, True, "", False

    current_page = next_clicks - prev_clicks
    total_pages = len(images)
    if current_page < 0:
        current_page = 0
    elif current_page >= total_pages:
        current_page = total_pages - 1

    # Display the current page image
    page_image = html.Img(src='data:image/png;base64,{}'.format(images[current_page]), style={'width': '100%'})

    # Display the response for the current page
    response_content = None
    if isinstance(response_json, dict):
        page_content = response_json.get(f"Page{current_page + 1}", "No content available for this page.")
        response_content = dbc.Card([
            dbc.CardHeader(f"Page {current_page + 1}"),
            dbc.CardBody(dcc.Markdown(page_content))
        ], className="my-2")
    
    logging.debug(f"Current page: {current_page}, Total pages: {total_pages}")

    return page_image, current_page == 0, current_page == total_pages - 1, response_content, False

if __name__ == '__main__':
    app.run_server(debug=True)