# Makefile for Mentat Protocol Whitepaper

# Variables
MAIN_TEX = mentat-protocol-whitepaper
OUTPUT_DIR = build
FIGURES_DIR = figures

# Default target
all: pdf

# Create output directory if it doesn't exist
$(OUTPUT_DIR):
	mkdir -p $(OUTPUT_DIR)

# Compile the LaTeX document
pdf: $(OUTPUT_DIR)
	pdflatex -output-directory=$(OUTPUT_DIR) $(MAIN_TEX).tex
	bibtex $(OUTPUT_DIR)/$(MAIN_TEX)
	pdflatex -output-directory=$(OUTPUT_DIR) $(MAIN_TEX).tex
	pdflatex -output-directory=$(OUTPUT_DIR) $(MAIN_TEX).tex
	cp $(OUTPUT_DIR)/$(MAIN_TEX).pdf .

# Quick compile (no bibliography)
quick: $(OUTPUT_DIR)
	pdflatex -output-directory=$(OUTPUT_DIR) $(MAIN_TEX).tex
	cp $(OUTPUT_DIR)/$(MAIN_TEX).pdf .

# Clean build files
clean:
	rm -rf $(OUTPUT_DIR)
	rm -f $(MAIN_TEX).pdf

# Clean all generated files including PDF
cleanall: clean
	rm -f *.pdf

# View the PDF (works on most Unix systems)
view: pdf
	@if command -v xdg-open > /dev/null; then \
		xdg-open $(MAIN_TEX).pdf; \
	elif command -v open > /dev/null; then \
		open $(MAIN_TEX).pdf; \
	else \
		echo "Please open $(MAIN_TEX).pdf manually"; \
	fi

# Count words (approximate)
wordcount:
	@echo "Approximate word count:"
	@detex $(MAIN_TEX).tex | wc -w

# Check LaTeX syntax
check:
	lacheck $(MAIN_TEX).tex

# Create a release version
release: pdf
	@echo "Creating release version..."
	@DATE=$$(date +%Y%m%d); \
	cp $(MAIN_TEX).pdf mentat-protocol-whitepaper-$$DATE.pdf; \
	echo "Created: mentat-protocol-whitepaper-$$DATE.pdf"

# Help target
help:
	@echo "Available targets:"
	@echo "  all      - Build the complete PDF with bibliography (default)"
	@echo "  pdf      - Build the complete PDF with bibliography"
	@echo "  quick    - Quick build without bibliography"
	@echo "  clean    - Remove build files"
	@echo "  cleanall - Remove all generated files including PDF"
	@echo "  view     - Build and open the PDF"
	@echo "  wordcount- Count approximate words in document"
	@echo "  check    - Check LaTeX syntax"
	@echo "  release  - Create timestamped release version"
	@echo "  help     - Show this help message"

.PHONY: all pdf quick clean cleanall view wordcount check release help