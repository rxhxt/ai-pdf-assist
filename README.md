# DocuMentor: Tailored Learning from PDFs 

DocuMentor is an intelligent learning tool designed to help students better understand and retain concepts from PDF documents. Built with Generative AI (GenAI), React, and Flask, the tool enhances learning by generating explanations, FAQs, and up to 50 unique, customized questions for every uploaded document. It aligns with diverse educational standards and subjects, effectively doubling learning efficiency.

---
## Features:
-  Automatically generates additional explanations tailored to the content of uploaded PDFs.
-  Provides a list of frequently asked questions relevant to the document’s content.
-  Creates various types of Q&A along with application based questions (if applicable)
---
## Prerequisites

Ensure you have the following installed:

-  [Python 3.8+](https://www.python.org/downloads/)
-  [pip](https://pip.pypa.io/en/stable/)
-  A virtual environment tool like `venv` or `virtualenv`
-  [Node.js (LTS)](https://nodejs.org/)
-  [npm or yarn](https://www.npmjs.com/)
---
## Get Started: 
### 1.  Setting Up API Keys

To use this application, you must obtain API keys from [AI Studio](https://aistudio.google.com/app/apikey) and store them securely in the `.env.local` file.
#### Steps to Obtain API Keys

1. Visit [AI Studio API Key Page](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Create or select an existing project.
4. Generate an API key if one doesn’t already exist.
5. Copy the generated API key to your clipboard.

---

#### Storing API keys
1. Create a .env.local file in the frontend directory:
  ```bash
  touch .env.local
  ```

2. Open the .env.local file in a text editor and add the API key:
  ```bash
    REACT_APP_API_KEY=your_api_key_here
  ```
Replace your_api_key_here with the API key you copied from AI Studio.

3.	Save and close the file.

Important Notes
	•	Do not commit .env.local to version control. Make sure your .gitignore file contains the .env.local entry to prevent accidental exposure of your API key.
	•	For production environments, ensure the API key is stored securely using environment variables or a secrets management service.

### 2. Clone the Repository
```bash
git clone https://github.com/rxhxt/ai-pdf-assist.git
cd ai-pdf-assist
```
### 3. Set up and Start the API

1. Create and activate a virtual environment:

   
   On macOS/Linux:
   ``` bash
   python3 -m venv venv
   source venv/bin/activate
   ```
   On Windows:
   ``` bash
   python -m venv venv
   venv\Scripts\activate
   ```
2. Install Python dependencies:
   ``` bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ``` bash
   python api.py
   ```
### 4. Set up and run the FrontEnd
1. Install the dependencies:
   ``` bash
   cd ./pdf-helper
   npm install
   ```
2. Start the server
   ```bash
   npm start
   ```
   The application will run at http://localhost:3000

---
## Contribution Guidelines

We welcome contributions! To get started:
1.	Fork the repository.

2. Create a new branch for your feature/bug fix:
   ```bash
   git checkout -b feature-name
   ```

3. Commit your changes:

     ```bash
     git commit -m "Description of changes" 
     ```

4.	Push your branch and open a pull request.


---
## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For questions, suggestions, or feedback, please contact:

- **Email:** [rnagotkar@seattleu.edu](mailto:rnagotkar@seattleu.edu)
- **GitHub:** [@rxhxt](https://github.com/rxhxt)
