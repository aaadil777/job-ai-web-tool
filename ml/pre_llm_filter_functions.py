import pdfplumber, re
from io import BytesIO
from pprint import pprint

class ParsingFunctionsPreLLM:

    HEADERS = [
        r"skills?", r"education", r"coursework", r"experience",
        r"projects?", r"activities?", r"leadership?", r"awards?"
    ]

    CANON_MAP = {
    "skills summary": "skills",
    "skills": "skills",
    "education": "education",
    "relevant coursework": "coursework",
    "coursework": "coursework",
    "work experience": "experience",
    "experience": "experience",
    "personal project": "projects",
    "academic project": "projects",
    "projects": "projects",
    "leadership & campus involvement": "leadership",
    "leadership": "leadership",
    }      

    TOKENS = r"|".join(HEADERS)
    HEADERS_REGEX = re.compile(rf"^(?P<title>.{{0,10}}(?:{TOKENS})\b.*)$", re.I | re.M)
    EMAIL_REGEX = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
    PHONE_REGEX = re.compile(r"\+?\d[\d\-\s().]{7,}\d")
    URL_REGEX = re.compile(r"(https?://[^\s)]+|linkedin\.com/\S+|github\.com/\S+)", re.I)
    HYPHEN_WRAP_REGEX = re.compile(r'(\w)[-–]\n(\w)')
    SOFT_WRAP_REGEX   = re.compile(r'(?<!\.)\n(?!\n)')

    """A class for pre-LLM text filtering functions."""
    def __init__(self, path):
        self.path = path
        self.unfiltered_text = ""
        self.sections = {}
        self.contacts = {}
        self.cleaned = {}

    def extract_text_from_pdf_bytes(self, content: bytes):
        """Extract text from in-memory PDF bytes."""
        with pdfplumber.open(BytesIO(content)) as pdf:
            self.unfiltered_text = "\n".join((page.extract_text() or "") for page in pdf.pages)
        return self.unfiltered_text
    
    def clean_up_text(self,s):
        # join hyphenated words on adjacent lines
        s = self.HYPHEN_WRAP_REGEX.sub(r'\1-\2', s)
        # replace new line with space if \n exists inside a paragraph
        s = self.SOFT_WRAP_REGEX.sub(' ', s)
        return s

    def define_sections(self, extracted_text):
        """Define sections based on provided headers. The output is a dictionary where the values
          become the section headers and the keys become the content of each section."""
        all_headers_char_index = list()

        # find the headers for all the sections in the resume
        found_headers = list(self.HEADERS_REGEX.finditer(extracted_text.lower()))

        # if no headers found, return the entire body of text as one section.
        if not found_headers:
            self.sections = {"body": self.unfiltered_text}
            return self.sections
        
        # record the header and its position in the body of text
        for fh in found_headers:
            all_headers_char_index.append((fh.group("title").lower(),fh.start("title")))
        all_headers_char_index.append(("__end__",len(extracted_text)))

        # use the header positions to slice out the sections so that they can be stored accordingly.
        for i in range(len(all_headers_char_index) -1):
            title, start = all_headers_char_index[i]
            end = all_headers_char_index[i+1][1]
            
            # normalize header titles
            title_stripped = title.strip()
            title_stripped_normalized = title_stripped.lower().strip()
            canon = self.CANON_MAP.get(title_stripped_normalized, title_stripped_normalized)

            # extract the body of text for each section                           
            body = extracted_text[start + len(title):end].strip()

            # clean the text with normalization techniques
            clean_up_body = self.clean_up_text(body)

            # store data in dictionary
            if canon in self.sections:
                self.sections[canon] = (self.sections[canon] + "\n" + clean_up_body).strip()
            else:
                self.sections[canon] = clean_up_body

        return self.sections
    
    def gather_contact_info_from_text(self, text: str):
        """Find and return all names, emails, phone numbers, and URLs."""
        emails = set(self.EMAIL_REGEX.findall(text))
        phones = set(self.PHONE_REGEX.findall(text))
        urls   = set(self.URL_REGEX.findall(text))

        self.contacts = {
            "name": text.splitlines()[0].strip().title() if text.splitlines() else None,
            "emails": sorted(emails),
            "phones": sorted(phones),
            "urls":   sorted(urls)
        }

        return self.contacts


if __name__ == "__main__":
    # import resume PDF file path into the parser class
    text_path = ParsingFunctionsPreLLM(r"ml\mock_resumes\Computer Science CAREER sample_1.pdf")