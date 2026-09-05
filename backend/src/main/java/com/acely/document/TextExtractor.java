package com.acely.document;
import java.io.*; import java.util.Locale;
import org.apache.pdfbox.Loader; import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow; import org.apache.poi.xwpf.extractor.XWPFWordExtractor; import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service; import org.springframework.web.multipart.MultipartFile;
@Service public class TextExtractor {
 public String extract(MultipartFile file) throws IOException { String name=file.getOriginalFilename().toLowerCase(Locale.ROOT); try(InputStream in=file.getInputStream()) { if(name.endsWith(".txt")) return new String(in.readAllBytes()); if(name.endsWith(".pdf")) { try(var pdf=Loader.loadPDF(in.readAllBytes())) { return new PDFTextStripper().getText(pdf); } } if(name.endsWith(".docx")) { try(var doc=new XWPFDocument(in); var extractor=new XWPFWordExtractor(doc)) { return extractor.getText(); } } if(name.endsWith(".pptx")) { try(var slides=new XMLSlideShow(in)) { StringBuilder out=new StringBuilder(); slides.getSlides().forEach(s -> s.getShapes().forEach(shape -> { if(shape instanceof org.apache.poi.xslf.usermodel.XSLFTextShape text) out.append(text.getText()).append('\n'); })); return out.toString(); } } throw new IllegalArgumentException("Supported files are PDF, DOCX, PPTX, and TXT."); } }
}
