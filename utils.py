import fitz  
from PIL import Image
import io
import google.generativeai as genai
from dotenv import load_dotenv
import os
import base64
import json
import re
# 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
# "Summary": "Give general summary of the PDF",

# "Images": "A short description of the image on this page. If there are multiple images, provide a list of descriptions with titles. Exclude the PDF page image itself. Focus on extracting images, block diagrams, graphs, visualizations, etc., from PDF page images.",
#         "Facts": "An interesting fact from this page.",
#         "Equations": "Explanation of all equations from this page, if any.",
#         "Code": {
#           "language": "Language of the code",
#           "summary": "Brief summary of the code."
#         }

# prompt ="""You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
# Keywords: Get maximum 10 important keywords from the image which are mentioned in the image (do not assume any words outside the image), Give definitions or meanings of those words. If the word is a theory or an acronym give one reference link for it if possible.
# Prioritize words which are related to the general theme of the PDF.
# To extract the keywords, understand what the image is about.
# Do not use \" anywhere in the text. 
# Images: Identify the general idea of the image and give a short description of it. Do not consider the PDF page image as the Image to add in this section. You need to extract images, block diagrams, graphs, visualizations, etc from PDF page images. If it is a block diagram give an explanation of each block in 1 line. If no image then give null.
# Interesting Facts: If there are any interesting facts that can make the PDF fun give it. Get only 1 per 2-4 pages. If no facts then give null.
# Equations: If any equations are shown or written, explain the equation and what it is for. If no equation then give null.
# Code: If there is any code written give the language used and give a brief summary of the code. If no code then give null.
# Summary: Give a summary of the overall PDF in 10-15 sentences.
# I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like

# {
#     "Pages":[
#     {
#       "Page1": {
#         "Keywords": [
#           {
#             "keyword": "keyword1",
#             "definition": "Definition of keyword1."
#           }
#         ],
        
#       }
#     },
#     {
#       "Page2": {
#         "Keywords": [
#           {
#             "keyword": "keyword2",
#             "definition": "Definition of keyword2."
#           }
#         ],
       
#       }
#     }
#   ]
#   }
# Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If 3 images are given treat it like 3 pages.
# """
keyword_prompt = """
You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
index: Current page number starting with 1
 Keywords: Get maximum 10 important keywords from the image which are mentioned in the image (do not assume any words outside the image), Give definitions or meanings of those words. If the word is a theory or an acronym give one reference link for it if possible.
 Prioritize words which are related to the general theme of the PDF. Do not repeat keywords across pages
 To extract the keywords, understand what the image is about.
 use ' wherever \" is needed remember this.
I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like
Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If n pages are given treat them as n images.
Use this JSON schema:

Keywords = {'keyword': str, 'definitions': str}

Page = {'index': int , 'keywords': list[Keywords]}
Return: list[Page]

"""
final_prompt = """
You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
index: Current page number starting with 1
 Keywords: Get maximum 10 important keywords from the image which are mentioned in the image (do not assume any words outside the image), Give definitions or meanings of those words. If the word is a theory or an acronym give one reference link for it if possible.
 Prioritize words which are related to the general theme of the PDF. Do not repeat keywords across pages
 To extract the keywords, understand what the image is about.
 use ' wherever \" is needed remember this.
 Code: If there is any code written give the language used and give a brief summary of the code. If no code then give empty.
 Images: "A short description of the diagrams, visualization, block diagrams, flowcharts, graphs on this page. If there are multiple, provide a list of descriptions with titles. Exclude the PDF page image itself. Focus on extracting images, block diagrams, graphs, visualizations, etc. which are related to the theme, from PDF page images." If nothing return null,
 Do not extract ads, logos, etc.  If no image then do not give anything
 Equations: If any equations are shown or written, explain the equation and what it is for. If no equation then give empty.
 
I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like
Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If n pages are given treat them as n images.
Use this JSON schema:

Keywords = {'keyword': str, 'definitions': str}
Code = {'language':str, 'summary':str}
Images = list[str]
Equations = list[str]
Page = {'index': int , 'keywords': list[Keywords], 'code': Code, 'images': Images, 'equations': Equations}
Return: list[Page]

Output:

"""


code_prompt = """
You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
index: Current page number starting with 1
Code: If there is any code written give the language used and give a brief summary of the code. If no code then give null.
 I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like
Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If n pages are given treat them as n images.
Use this JSON schema:
Code = {'language':str, 'summary':str}
Page = {'index': int , 'code': Code}
Return: list[Page]
"""

image_prompt = """
You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
index: Current page number starting with 1
 Images: "A short description of the image on this page. If there are multiple images, provide a list of descriptions with titles. Exclude the PDF page image itself. Focus on extracting images, block diagrams, graphs, visualizations, etc. which are related to the theme, from PDF page images." If nothing return null,
 Do not extract ads, logos, etc. 
 I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like
Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If n pages are given treat them as n images.
Use this JSON schema:
Images = list[str]
Page = {'index': int , 'images': Images}
Return: list[Pages]
"""

equation_prompt = """
You are a helpful personal assistant. You are given images extracted from a single PDF. From the images given to you give me the following things:
index: Current page number starting with 1
 Equations: If any equations are shown or written, explain the equation and what it is for. If no equation then give null.
 I want all of this for every page of the PDF if these things are present in the page (every image is every page). Give it in JSON format so that it can be parsed in JSON which can be used directly with JSON.parse like
Ignore stopwords, references in research papers, text not related to general idea. Do not repeat the keywords in different pages. Give output for only the images given and no more. If n pages are given treat them as n images.
Use this JSON schema:
Images = list[str]
Page = {'index': int , 'images': Images}
Return: list[Pages]
"""


def convert_to_json(input_string):
    # Extract JSON content from markdown-style block
    pattern = r'```json\s+([\s\S]+?)\s+```'
    match = re.search(pattern, input_string)
    
    if match:
        # Get JSON-like content and attempt to clean it up
        json_part = match.group(1)
        
        # Remove any stray backslashes or unescaped quotes within keys or values
        json_part = json_part.replace('\n', '')  # Remove all newlines
        json_part = json_part.replace("'", '"')  # Convert single quotes to double quotes
        json_part = re.sub(r'(\s+)?(\w+):', r'"\2":', json_part)  # Ensure keys are properly quoted
        # print(json_part)
        # print("JSON")
        try:
            # Convert the cleaned JSON string to a dictionary
            data = json.loads(json_part)
            # Return the dictionary as a pretty-printed JSON string
            return json.dumps(data, indent=4)
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON: {e}")
            return json_part
    else:
        return "No JSON found in the input string"






def pdf_to_pil_images(pdf_bytes):
    """
    Convert a PDF file to a list of PIL images.
    
    Args:
    pdf_bytes (bytes): The PDF file data in bytes.

    Returns:
    list: A list of PIL.Image objects.
    """
    # Open the PDF file
    doc = fitz.open("pdf", pdf_bytes)
    pil_images = []

    # Loop through each page
    for page in doc:
        pix = page.get_pixmap()
        img_bytes = pix.tobytes("ppm")

        img_io = io.BytesIO(img_bytes)
        
        pil_image = Image.open(img_io)
        pil_image = pil_image.convert("RGB")
        
        # Append to our list of images
        pil_images.append(pil_image)

    return pil_images





def get_response_from_gpt(images, prompt=final_prompt):
    load_dotenv(dotenv_path='.env.local')
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=GOOGLE_API_KEY)
   
    model = genai.GenerativeModel("gemini-1.5-pro-002",generation_config={"response_mime_type": "application/json"})
    images.append(prompt)
    response = model.generate_content(images, generation_config=genai.GenerationConfig(
        response_mime_type="application/json"
    ),)

    try:
        return json.loads(str(response.text))
    except:
      return response.text

def gather_all_responses(images):
    response_list = []
    for prompt in [keyword_prompt,image_prompt,code_prompt, equation_prompt]:
        response_list.append(get_response_from_gpt(images, prompt))
    
    return response_list
    
def generate_faq_from_gpt(images):
    load_dotenv(dotenv_path='.env.local')
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash",generation_config={"response_mime_type": "application/json"})
    faq_prompt = '''
    You are a helpful personal assistant. You are given images extracted from a single PDF. Try to understand the nature of the PDF whether it is a business, educational, 
    professional PDF etc. Understand the main idea of the PDF. From the PDF content produce top 5 Frequently Asked Questions (FAQs). 
    Make sure the questions are made in such a way that the answer is found in the PDF. No answer should be from outside the PDF. 
    The answer should be 3-4 lines. The output should be a list of json of format:
    Do not return any leading or trailing characters just give the list.
    Do not repeat the Questions. Make Sure to give json
    Use this JSON schema:    
    Questions = {'Question':str, 'Answer': str}
    Return: list[Questions]
    '''
    #   [
    #     \{ "Question": "", "Answer":"" \},  \{ "Question": "", "Answer":"" \}, \{ "Question": "", "Answer":"" \}, \{ "Question": "", "Answer":"" \}, \{ "Question": "", "Answer":"" \}
    # ] 
    images.append(faq_prompt)
    response = model.generate_content(images)
    try:
        return json.loads(str(response.text)[8:-4])
    except:
        return response.text
    

if __name__=="__main__":
    pdf = './static/test1.pdf'
    pdf_bytes = None
    with open(pdf, "rb") as file:
        pdf_bytes = file.read()
    # decoded = base64.b64decode(pdf)
    images = pdf_to_pil_images(pdf_bytes)
    # resp = gather_all_responses(images)
    resp = get_response_from_gpt(images)
  
    print(resp)
    print(len(resp))
    print(len(images))
    
    
    
# TODO:
# 1. Summary overall and pagewise
# 2. Slide with text is going in images
# 3. Correct number of pages
 