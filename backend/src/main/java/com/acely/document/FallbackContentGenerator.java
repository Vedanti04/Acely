package com.acely.document;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FallbackContentGenerator {

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Generates all four Acely resources locally from the extracted
     * study material when Gemini is unavailable.
     */
    public Map<String, JsonNode> generateAll(String material) {

        if (material == null || material.isBlank()) {
            throw new IllegalArgumentException(
                    "No study material is available for fallback generation."
            );
        }

        String cleanedText = cleanText(material);

        Map<String, JsonNode> result = new LinkedHashMap<>();

        result.put("notes", generateNotes(cleanedText));
        result.put("flashcards", generateFlashcards(cleanedText));
        result.put("quiz", generateQuiz(cleanedText));
        result.put("mindmap", generateMindMap(cleanedText));

        return result;
    }

    // ============================================================
    // NOTES
    // ============================================================

    private JsonNode generateNotes(String text) {

        Map<String, Object> notes = new LinkedHashMap<>();

        String title = extractTitle(text);

        notes.put(
                "title",
                title.isBlank() ? "Study Notes" : title
        );

        notes.put(
                "overview",
                createOverview(text)
        );

        notes.put(
                "keyPoints",
                createKeyPoints(text)
        );

        notes.put(
                "definitions",
                createDefinitions(text)
        );

        notes.put(
                "examTips",
                createExamTips(text)
        );

        return mapper.valueToTree(notes);
    }

    private String createOverview(String text) {

        List<String> sentences = splitSentences(text);

        if (sentences.isEmpty()) {
            return "These notes are generated from the uploaded study material.";
        }

        StringBuilder overview = new StringBuilder();

        int count = Math.min(4, sentences.size());

        for (int i = 0; i < count; i++) {

            if (overview.length() > 0) {
                overview.append(" ");
            }

            overview.append(sentences.get(i));
        }

        return trimToLength(overview.toString(), 700);
    }

    private List<String> createKeyPoints(String text) {

        List<String> sentences = splitSentences(text);

        List<String> keyPoints = new ArrayList<>();

        for (String sentence : sentences) {

            String s = sentence.trim();

            if (s.length() < 25) {
                continue;
            }

            if (isUsefulSentence(s)) {

                keyPoints.add(
                        trimToLength(s, 250)
                );

                if (keyPoints.size() >= 10) {
                    break;
                }
            }
        }

        if (keyPoints.isEmpty() && !sentences.isEmpty()) {

            for (int i = 0;
                 i < Math.min(5, sentences.size());
                 i++) {

                keyPoints.add(
                        trimToLength(
                                sentences.get(i),
                                250
                        )
                );
            }
        }

        return keyPoints;
    }

    private List<Map<String, String>> createDefinitions(String text) {

        List<Map<String, String>> definitions =
                new ArrayList<>();

        List<String> sentences =
                splitSentences(text);

        for (String sentence : sentences) {

            String lower =
                    sentence.toLowerCase();

            String[] patterns = {
                    " is ",
                    " are ",
                    " means ",
                    " refers to ",
                    " defined as ",
                    " known as "
            };

            for (String pattern : patterns) {

                int index =
                        lower.indexOf(pattern);

                if (index > 0 && index < 120) {

                    String term =
                            sentence
                                    .substring(0, index)
                                    .trim();

                    String meaning =
                            sentence
                                    .substring(
                                            index + pattern.length()
                                    )
                                    .trim();

                    term = cleanTerm(term);

                    meaning =
                            trimToLength(
                                    meaning,
                                    300
                            );

                    if (
                            isValidTerm(term)
                                    && meaning.length() > 10
                    ) {

                        Map<String, String> definition =
                                new LinkedHashMap<>();

                        definition.put(
                                "term",
                                term
                        );

                        definition.put(
                                "meaning",
                                meaning
                        );

                        definitions.add(
                                definition
                        );

                        break;
                    }
                }
            }

            if (definitions.size() >= 8) {
                break;
            }
        }

        return definitions;
    }

    private List<String> createExamTips(String text) {

        List<String> tips = new ArrayList<>();

        List<String> keyPoints =
                createKeyPoints(text);

        for (String point : keyPoints) {

            tips.add(
                    "Revise and understand this concept: "
                            + trimToLength(point, 180)
            );

            if (tips.size() >= 5) {
                break;
            }
        }

        if (tips.isEmpty()) {

            tips.add(
                    "Review the important concepts from the uploaded material."
            );

            tips.add(
                    "Focus on definitions, processes, and key terms."
            );

            tips.add(
                    "Revise the material before attempting the quiz."
            );
        }

        return tips;
    }

    // ============================================================
    // FLASHCARDS
    // ============================================================

    private JsonNode generateFlashcards(String text) {

        Map<String, Object> root =
                new LinkedHashMap<>();

        List<Map<String, String>> cards =
                new ArrayList<>();

        List<String> sentences =
                splitSentences(text);

        int cardNumber = 1;

        for (String sentence : sentences) {

            String answer = sentence.trim();

            if (answer.length() < 30) {
                continue;
            }

            String question =
                    createFlashcardQuestion(
                            answer,
                            cardNumber
                    );

            Map<String, String> card =
                    new LinkedHashMap<>();

            card.put(
                    "question",
                    question
            );

            card.put(
                    "answer",
                    trimToLength(answer, 350)
            );

            card.put(
                    "difficulty",
                    cardNumber <= 5
                            ? "Easy"
                            : "Medium"
            );

            cards.add(card);

            cardNumber++;

            if (cards.size() >= 15) {
                break;
            }
        }

        if (cards.size() < 5) {

            List<String> chunks =
                    createChunks(text, 5);

            for (String chunk : chunks) {

                if (chunk.length() < 20) {
                    continue;
                }

                Map<String, String> card =
                        new LinkedHashMap<>();

                card.put(
                        "question",
                        "What does this part of the study material explain?"
                );

                card.put(
                        "answer",
                        trimToLength(chunk, 350)
                );

                card.put(
                        "difficulty",
                        "Easy"
                );

                cards.add(card);

                if (cards.size() >= 10) {
                    break;
                }
            }
        }

        root.put(
                "flashcards",
                cards
        );

        return mapper.valueToTree(root);
    }

    private String createFlashcardQuestion(
            String sentence,
            int number
    ) {

        String clean =
                sentence.trim();

        String lower =
                clean.toLowerCase();

        // Definition-style sentence
        String[] definitionPatterns = {
                " is ",
                " are ",
                " means ",
                " refers to ",
                " is defined as ",
                " are defined as ",
                " is known as "
        };

        for (String pattern : definitionPatterns) {

            int index =
                    lower.indexOf(pattern);

            if (index > 0 && index < 100) {

                String term =
                        clean
                                .substring(0, index)
                                .trim();

                if (isValidTerm(term)) {

                    return "What is "
                            + cleanTerm(term)
                            + "?";
                }
            }
        }

        // Feature-style sentence
        if (
                lower.contains("feature")
                        || lower.contains("features")
        ) {

            return "What feature is described in this statement?";
        }

        // Example-style sentence
        if (
                lower.contains("for example")
                        || lower.contains("example:")
                        || lower.contains("such as")
        ) {

            return "What example is given in the study material?";
        }

        // Process-style sentence
        if (
                lower.contains("step")
                        || lower.contains("process")
                        || lower.contains("procedure")
        ) {

            return "What process or step is explained here?";
        }

        // Application / usage
        if (
                lower.contains("used to")
                        || lower.contains("used for")
                        || lower.contains("application")
        ) {

            return "What is this concept used for?";
        }

        // Characteristics
        if (
                lower.contains("important")
                        || lower.contains("advantage")
                        || lower.contains("benefit")
        ) {

            return "What important point is explained here?";
        }

        // Varied fallback questions
        String[] questions = {
                "What does this statement explain?",
                "What is the main idea described here?",
                "What concept is explained in this statement?",
                "What should you remember from this point?",
                "Which concept is represented by this information?"
        };

        return questions[
                (number - 1) % questions.length
                ];
    }

    // ============================================================
    // QUIZ
    // ============================================================

    private JsonNode generateQuiz(String text) {

        Map<String, Object> root =
                new LinkedHashMap<>();

        List<Map<String, Object>> questions =
                new ArrayList<>();

        List<String> sentences =
                splitSentences(text);

        int questionNumber = 1;

        for (String sentence : sentences) {

            String answer =
                    sentence.trim();

            if (answer.length() < 25) {
                continue;
            }

            Map<String, Object> question =
                    createQuizQuestion(
                            answer,
                            questionNumber
                    );

            questions.add(question);

            questionNumber++;

            if (questions.size() >= 10) {
                break;
            }
        }

        // Guarantee exactly 10 questions.
        while (questions.size() < 10) {

            int index =
                    questions.size();

            String answer;

            if (!sentences.isEmpty()) {

                answer =
                        trimToLength(
                                sentences.get(
                                        index % sentences.size()
                                ),
                                180
                        );

            } else {

                answer =
                        "The uploaded material contains study-related information.";
            }

            Map<String, Object> question =
                    createGenericQuizQuestion(
                            answer,
                            index + 1
                    );

            questions.add(question);
        }

        root.put(
                "questions",
                questions
        );

        return mapper.valueToTree(root);
    }

    private Map<String, Object> createQuizQuestion(
            String answer,
            int number
    ) {

        Map<String, Object> question =
                new LinkedHashMap<>();

        String lower =
                answer.toLowerCase();

        String questionText;

        // Definition question
        String term =
                extractDefinitionTerm(answer);

        if (!term.isBlank()) {

            questionText =
                    "What does "
                            + term
                            + " mean?";
        }

        // Feature question
        else if (
                lower.contains("feature")
                        || lower.contains("features")
        ) {

            questionText =
                    "Which statement correctly describes a feature discussed in the material?";
        }

        // Usage question
        else if (
                lower.contains("used to")
                        || lower.contains("used for")
        ) {

            questionText =
                    "What is the main use described in the material?";
        }

        // Example question
        else if (
                lower.contains("for example")
                        || lower.contains("example:")
        ) {

            questionText =
                    "Which statement represents the example explained in the material?";
        }

        // Process question
        else if (
                lower.contains("process")
                        || lower.contains("step")
                        || lower.contains("procedure")
        ) {

            questionText =
                    "Which statement correctly describes the process discussed?";
        }

        // Varied general questions
        else {

            String[] templates = {
                    "Which statement correctly describes this concept?",
                    "What is the main idea presented about this topic?",
                    "Which statement best explains the concept?",
                    "What important point is given about this topic?",
                    "Which statement is correct according to the study material?"
            };

            questionText =
                    templates[
                            (number - 1)
                                    % templates.length
                            ];
        }

        List<String> options =
                new ArrayList<>();

        options.add(
                trimToLength(answer, 180)
        );

        options.add(
                "This concept is not discussed in the uploaded material."
        );

        options.add(
                "The material gives the opposite explanation."
        );

        options.add(
                "The uploaded material does not provide this information."
        );

        question.put(
                "question",
                questionText
        );

        question.put(
                "options",
                options
        );

        question.put(
                "correctAnswer",
                trimToLength(answer, 180)
        );

        question.put(
                "explanation",
                "The correct answer is supported by the uploaded study material."
        );

        question.put(
                "difficulty",
                number <= 5
                        ? "Easy"
                        : "Medium"
        );

        return question;
    }

    private Map<String, Object> createGenericQuizQuestion(
            String answer,
            int number
    ) {

        Map<String, Object> question =
                new LinkedHashMap<>();

        String[] templates = {
                "Which statement correctly describes the study material?",
                "Which point is supported by the uploaded material?",
                "What important information is presented in the material?",
                "Which statement matches the uploaded study content?"
        };

        String questionText =
                templates[
                        (number - 1)
                                % templates.length
                        ];

        List<String> options =
                new ArrayList<>();

        options.add(answer);

        options.add(
                "This topic is not covered in the material."
        );

        options.add(
                "The material presents a different explanation."
        );

        options.add(
                "No information about this topic is provided."
        );

        question.put(
                "question",
                questionText
        );

        question.put(
                "options",
                options
        );

        question.put(
                "correctAnswer",
                answer
        );

        question.put(
                "explanation",
                "This answer is taken from the uploaded study material."
        );

        question.put(
                "difficulty",
                "Easy"
        );

        return question;
    }

    private String extractDefinitionTerm(
            String sentence
    ) {

        String lower =
                sentence.toLowerCase();

        String[] patterns = {
                " is ",
                " are ",
                " means ",
                " refers to ",
                " is defined as ",
                " are defined as ",
                " is known as "
        };

        for (String pattern : patterns) {

            int index =
                    lower.indexOf(pattern);

            if (index > 0 && index < 100) {

                String term =
                        sentence
                                .substring(0, index)
                                .trim();

                term =
                        cleanTerm(term);

                if (isValidTerm(term)) {
                    return term;
                }
            }
        }

        return "";
    }

    // ============================================================
    // MIND MAP
    // ============================================================

    private JsonNode generateMindMap(String text) {

        Map<String, Object> root =
                new LinkedHashMap<>();

        String topic =
                extractTitle(text);

        if (topic.isBlank()) {
            topic = "Study Material";
        }

        root.put(
                "topic",
                topic
        );

        List<Map<String, String>> nodes =
                new ArrayList<>();

        List<Map<String, String>> edges =
                new ArrayList<>();

        Map<String, String> mainNode =
                new LinkedHashMap<>();

        mainNode.put(
                "id",
                "root"
        );

        mainNode.put(
                "label",
                topic
        );

        mainNode.put(
                "type",
                "root"
        );

        nodes.add(mainNode);

        List<String> points =
                createKeyPoints(text);

        int count =
                Math.min(points.size(), 8);

        for (int i = 0; i < count; i++) {

            String nodeId =
                    "node" + (i + 1);

            Map<String, String> node =
                    new LinkedHashMap<>();

            node.put(
                    "id",
                    nodeId
            );

            node.put(
                    "label",
                    trimToLength(
                            points.get(i),
                            100
                    )
            );

            node.put(
                    "type",
                    "concept"
            );

            nodes.add(node);

            Map<String, String> edge =
                    new LinkedHashMap<>();

            edge.put(
                    "source",
                    "root"
            );

            edge.put(
                    "target",
                    nodeId
            );

            edges.add(edge);
        }

        root.put(
                "nodes",
                nodes
        );

        root.put(
                "edges",
                edges
        );

        return mapper.valueToTree(root);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private String cleanText(String text) {

        return text
                .replaceAll("\\u0000", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private List<String> splitSentences(
            String text
    ) {

        List<String> sentences =
                new ArrayList<>();

        String[] parts =
                text.split(
                        "(?<=[.!?])\\s+"
                );

        for (String part : parts) {

            String sentence =
                    part.trim();

            if (!sentence.isBlank()) {
                sentences.add(sentence);
            }
        }

        return sentences;
    }

    private List<String> createChunks(
            String text,
            int numberOfChunks
    ) {

        List<String> chunks =
                new ArrayList<>();

        int chunkSize =
                Math.max(
                        200,
                        text.length()
                                / numberOfChunks
                );

        for (
                int start = 0;
                start < text.length();
                start += chunkSize
        ) {

            int end =
                    Math.min(
                            start + chunkSize,
                            text.length()
                    );

            String chunk =
                    text.substring(
                            start,
                            end
                    ).trim();

            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }

            if (chunks.size()
                    >= numberOfChunks) {
                break;
            }
        }

        return chunks;
    }

    private String extractTitle(
            String text
    ) {

        if (
                text == null
                        || text.isBlank()
        ) {
            return "Study Notes";
        }

        List<String> sentences =
                splitSentences(text);

        if (!sentences.isEmpty()) {

            return trimToLength(
                    sentences.get(0),
                    80
            );
        }

        return "Study Notes";
    }

    private boolean isUsefulSentence(
            String sentence
    ) {

        String lower =
                sentence.toLowerCase();

        String[] ignored = {
                "copyright",
                "references",
                "www.",
                "http://",
                "https://",
                "all rights reserved"
        };

        for (String word : ignored) {

            if (lower.contains(word)) {
                return false;
            }
        }

        return sentence.length() >= 30;
    }

    private String cleanTerm(
            String term
    ) {

        return term
                .replaceAll(
                        "^[\\d\\-•*\\s]+",
                        ""
                )
                .replaceAll(
                        "[\\.:;,-]+$",
                        ""
                )
                .trim();
    }

    private boolean isValidTerm(
            String term
    ) {

        return term.length() >= 2
                && term.length() <= 100
                && term.split("\\s+").length <= 12;
    }

    private String trimToLength(
            String text,
            int maxLength
    ) {

        if (text == null) {
            return "";
        }

        text = text.trim();

        if (text.length() <= maxLength) {
            return text;
        }

        return text
                .substring(0, maxLength)
                .trim()
                + "...";
    }
}

