from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "output" / "documents"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "StudyMind_AI_Mini_Project_Synopsis.docx"
ASSET_DIR = ROOT / "tmp" / "synopsis_assets"
ASSET_DIR.mkdir(parents=True, exist_ok=True)

PURPLE = "4F46E5"
DARK = "111827"
GREY = "4B5563"
LIGHT_PURPLE = "EEF2FF"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_margin(cell, top=110, start=140, bottom=110, end=140):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="D1D5DB", size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        element = borders.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:color"), color)


def set_font(run, size=11, bold=False, color=DARK, italic=False):
    run.font.name = "Aptos"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def add_text(doc, text, size=11, bold=False, align=None, before=0, after=7, line=1.15, color=DARK, italic=False):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = line
    r = p.add_run(text)
    set_font(r, size, bold, color, italic)
    return p


def heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_font(r, 14, True, PURPLE)
    return p


def subheading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_font(r, 11, True, DARK)
    return p


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.1
    set_font(p.add_run(text), 10.5, False, DARK)
    return p


def new_numbered_list(doc):
    numbering = doc.part.numbering_part.element
    abstract_id = None
    for abstract in numbering.findall(qn("w:abstractNum")):
        p_style = abstract.find(".//" + qn("w:pStyle"))
        if p_style is not None and p_style.get(qn("w:val")) == "ListNumber":
            abstract_id = abstract.get(qn("w:abstractNumId"))
            break
    if abstract_id is None:
        abstract_id = "0"
    used = [int(n.get(qn("w:numId"))) for n in numbering.findall(qn("w:num")) if n.get(qn("w:numId")).isdigit()]
    num_id = str(max(used, default=0) + 1)
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), num_id)
    abstract = OxmlElement("w:abstractNumId")
    abstract.set(qn("w:val"), abstract_id)
    num.append(abstract)
    lvl_override = OxmlElement("w:lvlOverride")
    lvl_override.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:startOverride")
    start.set(qn("w:val"), "1")
    lvl_override.append(start)
    num.append(lvl_override)
    numbering.append(num)
    return num_id


def numbered(doc, text, number):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.28)
    p.paragraph_format.first_line_indent = Inches(-0.28)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.1
    set_font(p.add_run(f"{number}. "), 10.5, False, DARK)
    set_font(p.add_run(text), 10.5, False, DARK)
    return p


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def add_footer(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    run = p.add_run("StudyMind AI - Mini Project Synopsis")
    set_font(run, 8.5, False, GREY)


def get_font(size, bold=False):
    candidates = [r"C:\\Windows\\Fonts\\arialbd.ttf" if bold else r"C:\\Windows\\Fonts\\arial.ttf"]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def rounded_box(draw, box, label, fill, outline, text_fill=DARK, font_size=23):
    draw.rounded_rectangle(box, radius=18, fill=fill, outline=outline, width=3)
    font = get_font(font_size, True)
    l, t, r, b = draw.textbbox((0, 0), label, font=font)
    x = (box[0] + box[2] - (r - l)) / 2
    y = (box[1] + box[3] - (b - t)) / 2 - 3
    draw.multiline_text((x, y), label, font=font, fill=f"#{text_fill}" if not text_fill.startswith("#") else text_fill, align="center", spacing=2)


def arrow(draw, start, end, color="64748B"):
    color = f"#{color}" if not color.startswith("#") else color
    draw.line([start, end], fill=color, width=5)
    x1, y1 = end
    x0, y0 = start
    if abs(x1 - x0) >= abs(y1 - y0):
        d = 1 if x1 > x0 else -1
        draw.polygon([(x1, y1), (x1 - 14 * d, y1 - 8), (x1 - 14 * d, y1 + 8)], fill=color)
    else:
        d = 1 if y1 > y0 else -1
        draw.polygon([(x1, y1), (x1 - 8, y1 - 14 * d), (x1 + 8, y1 - 14 * d)], fill=color)


def make_diagrams():
    architecture = ASSET_DIR / "architecture.png"
    img = Image.new("RGB", (1400, 720), "white")
    d = ImageDraw.Draw(img)
    title_font = get_font(30, True)
    d.text((42, 26), "StudyMind AI: High-Level Architecture", font=title_font, fill="#111827")
    rounded_box(d, (60, 235, 300, 395), "Student\nWeb Browser", "#EEF2FF", "#4F46E5")
    rounded_box(d, (400, 100, 690, 240), "React + Vite\nUser Interface", "#F5F3FF", "#7C3AED")
    rounded_box(d, (400, 390, 690, 530), "Dashboard &\nLearning Resources", "#F0FDF4", "#16A34A")
    rounded_box(d, (820, 100, 1110, 240), "API / Application\nService Layer", "#EFF6FF", "#2563EB")
    rounded_box(d, (820, 390, 1110, 530), "AI Content\nGeneration Service", "#FFF7ED", "#EA580C")
    rounded_box(d, (1190, 235, 1350, 395), "Learning Data\nand Files", "#FDF2F8", "#DB2777", font_size=20)
    arrow(d, (300, 315), (400, 170))
    arrow(d, (300, 315), (400, 460))
    arrow(d, (690, 170), (820, 170))
    arrow(d, (690, 460), (820, 460))
    arrow(d, (1110, 170), (1190, 280))
    arrow(d, (1110, 460), (1190, 350))
    img.save(architecture)

    usecase = ASSET_DIR / "usecase.png"
    img = Image.new("RGB", (1400, 760), "white")
    d = ImageDraw.Draw(img)
    d.text((42, 24), "StudyMind AI: Use Case Overview", font=title_font, fill="#111827")
    boundary = (330, 90, 1070, 700)
    d.rounded_rectangle(boundary, radius=18, outline="#94A3B8", width=3)
    d.text((565, 105), "StudyMind AI", font=get_font(22, True), fill="#334155")
    cases = [(490, 175, "Register / Sign in"), (490, 260, "Upload or paste\nstudy material"), (490, 345, "Generate notes,\nflashcards & quizzes"), (490, 450, "Explore mind map"), (490, 535, "Track study progress")]
    for x, y, text in cases:
        d.ellipse((x, y, x + 400, y + 62), fill="#F5F3FF", outline="#7C3AED", width=3)
        font = get_font(18, True)
        bb = d.multiline_textbbox((0, 0), text, font=font, align="center", spacing=1)
        d.multiline_text((x + 200 - (bb[2]-bb[0])/2, y + 31 - (bb[3]-bb[1])/2), text, font=font, fill="#312E81", align="center", spacing=1)
    # actors
    for cx, label in [(150, "Student"), (1235, "AI / Content\nService")]:
        d.ellipse((cx - 20, 245, cx + 20, 285), outline="#334155", width=4)
        d.line((cx, 285, cx, 350), fill="#334155", width=4)
        d.line((cx - 45, 310, cx + 45, 310), fill="#334155", width=4)
        d.line((cx, 350, cx - 38, 410), fill="#334155", width=4)
        d.line((cx, 350, cx + 38, 410), fill="#334155", width=4)
        bb = d.multiline_textbbox((0, 0), label, font=get_font(18, True), align="center")
        d.multiline_text((cx - (bb[2]-bb[0])/2, 435), label, font=get_font(18, True), fill="#111827", align="center")
    for y in (206, 291, 376, 481, 566):
        d.line((195, 310, 490, y), fill="#94A3B8", width=2)
    for y in (291, 376):
        d.line((1100, y, 1190, 310), fill="#94A3B8", width=2)
    img.save(usecase)
    return architecture, usecase


def add_title_cover(doc):
    for _ in range(3):
        add_text(doc, "", after=2)
    add_text(doc, "School of Computer Science & Applications", size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
    add_text(doc, "Department of Computer Science and Applications", size=11, align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
    add_text(doc, "Academic Year 2025-2026", size=11, align=WD_ALIGN_PARAGRAPH.CENTER, after=20)
    add_text(doc, "A", size=13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=3)
    add_text(doc, "MINI-PROJECT SYNOPSIS", size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=7, color=PURPLE)
    add_text(doc, "ON", size=11, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=8)
    add_text(doc, "StudyMind AI - An Intelligent Learning Assistant", size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=27, color=DARK)
    add_text(doc, "BY", size=11, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=9)
    add_text(doc, "[Student Name] ([PRN / Roll Number])", size=12, align=WD_ALIGN_PARAGRAPH.CENTER, after=5)
    add_text(doc, "[Student Name] ([PRN / Roll Number])", size=12, align=WD_ALIGN_PARAGRAPH.CENTER, after=25)
    add_text(doc, "Guide Name", size=11, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=4)
    add_text(doc, "[Guide Name]", size=12, align=WD_ALIGN_PARAGRAPH.CENTER, after=32)
    add_text(doc, "DR. VISHWANATH KARAD MIT WORLD PEACE", size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=2)
    add_text(doc, "UNIVERSITY, PUNE-411038", size=12, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=0)


def add_technology_table(doc):
    data = [
        ("Frontend", "React 19, Vite, Tailwind CSS, React Router"),
        ("Interactive visualization", "React Flow (@xyflow/react) for mind-map exploration"),
        ("HTTP integration", "Axios for communicating with the application API"),
        ("AI integration", "Planned AI content-generation service for summaries, cards and questions"),
        ("Backend / data", "Planned REST API, user data store and secure file storage"),
        ("Development tools", "VS Code, Node.js, npm, Git and GitHub"),
    ]
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(1.65)
    table.columns[1].width = Inches(4.85)
    hdr = table.rows[0].cells
    for cell, text in zip(hdr, ("Layer", "Tools / Technologies")):
        set_cell_shading(cell, PURPLE)
        set_cell_margin(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        set_font(p.add_run(text), 10.5, True, "FFFFFF")
    for i, (layer, tech) in enumerate(data):
        cells = table.add_row().cells
        for cell in cells:
            set_cell_margin(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        if i % 2 == 0:
            set_cell_shading(cells[0], LIGHT_PURPLE)
            set_cell_shading(cells[1], "FAFAFA")
        p = cells[0].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        set_font(p.add_run(layer), 10, True)
        p = cells[1].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        set_font(p.add_run(tech), 10)
    set_table_borders(table)


def build():
    architecture, usecase = make_diagrams()
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Inches(0.75)
    sec.bottom_margin = Inches(0.7)
    sec.left_margin = Inches(0.85)
    sec.right_margin = Inches(0.85)
    add_footer(sec)
    styles = doc.styles
    styles["Normal"].font.name = "Aptos"
    styles["Normal"]._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    styles["Normal"]._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    styles["Normal"].font.size = Pt(11)

    add_title_cover(doc)
    page_break(doc)

    heading(doc, "Problem Statement")
    add_text(doc, "Students increasingly receive learning material in many formats, including lecture notes, slides, PDFs, handouts and copied text. Converting this material into an effective study plan is often slow and repetitive. Learners must identify key concepts, create summaries, prepare flashcards, organise topics visually and design practice questions, usually across several disconnected tools.")
    add_text(doc, "This fragmented workflow can lead to passive reading, inconsistent revision and difficulty in tracking progress. A single, easy-to-use study workspace is needed to transform source material into active-learning resources and help students move from content collection to meaningful recall and practice.")
    heading(doc, "Objectives of the Project")
    add_text(doc, "The main aim of StudyMind AI is to design and develop an intelligent, student-centred web application that converts study material into structured learning resources. The project objectives are:", after=5)
    for item in [
        "Provide a simple interface for students to upload supported study files or paste text into a learning workspace.",
        "Generate concise notes, important concepts and exam-focused review material from the uploaded content.",
        "Support active recall through flashcards and automatically generated practice quizzes.",
        "Present topic relationships through interactive mind maps that learners can explore.",
        "Offer a dashboard that organises learning resources and communicates study progress at a glance.",
        "Create a responsive, approachable user experience that reduces the effort required to prepare for revision.",
    ], 1):
        numbered(doc, item, index)
    heading(doc, "Proposed Solution / Abstract")
    add_text(doc, "StudyMind AI is proposed as a web-based learning companion that brings study material, AI-assisted resource creation and revision activities into one focused interface. A student begins by creating an account and opening a personal learning workspace. They can add source material through file upload or by pasting text. The application then prepares reusable learning resources such as concise notes, important concepts, exam-focused review points, flashcards, quizzes and a visual mind map.")
    add_text(doc, "The interface is designed around short, focused study actions. Students can return to their dashboard, continue an existing collection, review flashcards, attempt a quiz and observe indicators such as resources created, cards mastered, study streak and focus time. The architecture keeps the user interface modular so that a content-generation service and a secure backend can be integrated without changing the learning workflow.")
    page_break(doc)

    heading(doc, "Scope of the Project")
    subheading(doc, "Technical Scope")
    for item in [
        "Development of a responsive single-page web application using React and Vite.",
        "Use of Tailwind CSS for a consistent, accessible learning interface.",
        "Route-based navigation for home, authentication, dashboard, upload, notes, flashcards, mind maps, quizzes and profile pages.",
        "Integration-ready API layer using Axios for authentication, content generation, data retrieval and progress updates.",
        "Interactive node-and-edge visualisation using React Flow for the mind-map module.",
    ]:
        bullet(doc, item)
    subheading(doc, "Functional Scope")
    for index, item in enumerate([
        "Allow learners to add PDFs, DOCX files, presentations, text files or pasted study content.",
        "Create AI-assisted notes, key concepts and exam-focused review resources.",
        "Enable flashcard practice and multiple-choice quiz sessions for active recall.",
        "Display topic connections in an explorable mind-map interface.",
        "Organise recent learning collections and show progress metrics in a personal dashboard.",
    ]:
        bullet(doc, item)
    subheading(doc, "Future Scope")
    for index, item in enumerate([
        "Personalised study recommendations based on quiz performance and revision history.",
        "Spaced-repetition scheduling and reminders for due flashcards.",
        "OCR and richer document parsing for scanned PDFs and image-based notes.",
        "Collaborative study spaces, shared collections and teacher feedback.",
        "Mobile application support and analytics for long-term learning habits.",
    ]:
        bullet(doc, item)
    heading(doc, "Tools and Technologies to be Used")
    add_technology_table(doc)
    page_break(doc)

    heading(doc, "System Architecture")
    add_text(doc, "StudyMind AI follows a modular client-service architecture. The existing React front end provides the learning workflow and is designed to communicate with an API layer. The API can coordinate user identity, uploaded material, generated resources and progress data, while an AI content-generation service transforms study content into useful learning artefacts.")
    doc.add_picture(str(architecture), width=Inches(6.7))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_font(p.add_run("Figure 1. High-level architecture of StudyMind AI"), 9, False, GREY, italic=True)
    subheading(doc, "Architecture Components")
    for item in [
        "Client interface: React pages and reusable components provide navigation, dashboard views, upload controls, cards, quizzes and mind-map interaction.",
        "Application API: exposes endpoints for authentication, content upload, resource creation, saved collections and progress information.",
        "AI content service: processes source material and returns structured notes, flashcards, quiz questions and concept relationships.",
        "Storage layer: retains user profiles, learning resources, progress metadata and source-file references with appropriate access control.",
    ]:
        bullet(doc, item)
    page_break(doc)

    heading(doc, "Use Case Diagram")
    add_text(doc, "The primary user of the system is the student. The student accesses StudyMind AI to manage a learning workspace, add material and use the resources produced from that material. The content-generation service supports the resource-generation actions within the system.")
    doc.add_picture(str(usecase), width=Inches(6.7))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_font(p.add_run("Figure 2. Primary use cases of StudyMind AI"), 9, False, GREY, italic=True)
    heading(doc, "User Flow")
    for item in [
        "The student registers or signs in and opens the dashboard.",
        "The student uploads material or pastes source text into the workspace.",
        "The application creates selected study resources: notes, flashcards, a mind map and/or quiz questions.",
        "The student studies the generated resources, answers quiz questions and returns for continued revision.",
        "The dashboard records recent learning activity and displays high-level progress indicators.",
    ], 1):
        numbered(doc, item, index)
    page_break(doc)

    heading(doc, "Modules")
    modules = [
        ("1. Authentication and Profile Module", "Provides registration, sign-in and profile-related entry points. It establishes a personal workspace where future backend integration can securely associate collections and progress with an individual learner."),
        ("2. Learning Material Input Module", "Provides file-drop, file-selection and pasted-text paths for students to add PDFs, DOCX files, PPTX files, TXT files or typed study material. It is the starting point for resource generation."),
        ("3. AI Notes Module", "Presents concise summaries, important concepts and exam-focused review points derived from the learner's material. The module is structured for quick scanning and revision."),
        ("4. Flashcard Module", "Supports active recall using prompt-and-answer cards, with simple navigation through a study set. It is intended to evolve into a scheduled, mastery-aware revision tool."),
        ("5. Mind-Map Module", "Uses an interactive graph interface to present a central topic and related concepts. Learners can explore or collapse branches to understand relationships between topics."),
        ("6. Quiz Module", "Delivers multiple-choice questions and captures a student's current selection. The module provides a basis for automated scoring, explanations and adaptive practice."),
        ("7. Dashboard and Progress Module", "Brings together current collections, recent learning, resources created, flashcards mastered, study streak and focus time, helping the learner decide what to study next."),
    ]
    for name, text in modules:
        subheading(doc, name)
        add_text(doc, text, size=10.5, after=5, line=1.08)
    page_break(doc)

    heading(doc, "Expected Outcomes")
    add_text(doc, "The project is expected to deliver a polished and extendable prototype of an AI-assisted learning workspace. The key outcomes are:", after=5)
    for index, item in enumerate([
        "A responsive StudyMind AI web interface covering material upload, notes, flashcards, mind maps, quizzes, dashboard and profile views.",
        "A clear workflow that turns learning material into activities that support summarisation, recall, visual organisation and self-assessment.",
        "A modular implementation that allows an AI content-generation service and backend persistence layer to be integrated incrementally.",
        "An engaging dashboard that helps students resume learning and interpret high-level progress signals.",
        "A foundation for future personalised learning features such as spaced repetition, recommendations and performance analytics.",
    ], 1):
        numbered(doc, item, index)
    heading(doc, "Limitations and Assumptions")
    add_text(doc, "The current project repository contains the client-side prototype and an API integration point. Therefore, the synopsis treats persistent storage, full authentication, document extraction and AI generation as planned service integrations rather than completed repository features. The quality of generated study resources will depend on the clarity and completeness of the source material and the selected AI service.")
    heading(doc, "Conclusion")
    add_text(doc, "StudyMind AI addresses a practical study challenge: students need more than a place to store materials; they need a guided path from source content to active revision. By combining a focused user interface with AI-ready generation modules, interactive mind maps, flashcards, quizzes and progress views, the project creates a strong base for a modern learning companion.")
    page_break(doc)

    heading(doc, "References")
    refs = [
        "React. React Documentation. https://react.dev/",
        "Vite. Vite Documentation. https://vite.dev/guide/",
        "Tailwind CSS. Tailwind CSS Documentation. https://tailwindcss.com/docs",
        "React Router. React Router Documentation. https://reactrouter.com/",
        "xyflow. React Flow Documentation. https://reactflow.dev/",
        "Axios. Axios Documentation. https://axios-http.com/docs/intro",
        "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving Students' Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1), 4-58.",
        "Karpicke, J. D., & Roediger, H. L. (2008). Repeated Retrieval During Learning Is the Key to Long-Term Retention. Journal of Memory and Language, 57(2), 151-162.",
        "Novak, J. D., & Canas, A. J. (2008). The Theory Underlying Concept Maps and How to Construct and Use Them. Technical Report IHMC CmapTools.",
    ]
    for index, ref in enumerate(refs, 1):
        numbered(doc, ref, index)

    doc.core_properties.title = "StudyMind AI - Mini Project Synopsis"
    doc.core_properties.author = "StudyMind AI Project Team"
    doc.save(OUT_FILE)
    print(OUT_FILE)


if __name__ == "__main__":
    build()
