# Multi-Label News Article Classification

An AI-powered system for automatic classification of news articles into multiple categories using state-of-the-art NLP models.

![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)

## Overview

This project implements and compares multiple machine learning approaches for multi-label text classification of news articles. The system automatically categorizes articles from RSS feeds into 14 predefined categories in real-time.

**Features:**
- Multiple ML models: SVM, XGBoost, BERT, RoBERTa
- Trained on EURLEX dataset (55K documents)
- Real-time RSS feed integration
- Interactive web interface with multi-select filtering

## Project Structure
```
Multi-label-News-Article-Classification/
├── app.py                          # Flask application
├── utils.py                        # Model & helper functions
├── requirements.txt                # Dependencies
├── test_model.py                   # Model testing script
├── Models/
│   ├── SVM/                        # SVM notebooks & preprocessing
│   ├── XGBoost/                    # XGBoost implementation
│   ├── BERT/                       # BERT training notebook
│   └── roberta/
│       ├── multi-label-news-classification-eurlex.ipynb
│       └── model_weights/          # Trained RoBERTa model (498 MB)
├── templates/                      # HTML templates
├── static/                         # CSS, JS, icons
└── Report & Documentation/
    ├── NLP_project_report.pdf      # Full project report
    └── Multi_label_News_Article_Classification_Demo.mp4
```

## Quick Start

### Prerequisites
- Python 3.8+
- GPU optional (improves inference speed)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Elkholtihm/Multi-label-News-Article-Classification.git
cd Multi-label-News-Article-Classification
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Download model weights
- Place the trained model in `Models/roberta/model_weights/`
- Or train your own using the provided notebooks

4. Run the application
```bash
python app.py
```

5. Open browser at `http://localhost:5000`

## Testing

Test the model before running the app:
```bash
python test_model.py
```

## Model Performance

| Model | F1 Macro | F1 Micro | Subset Accuracy | Training Time |
|-------|----------|----------|-----------------|---------------|
| **RoBERTa** | **70.47%** | **75.95%** | 28.38% | ~8h |
| BERT | ~70% | ~76% | ~28% | ~6h |
| SVM | 76.30% | 84.64% | 47.04% | ~3h |
| XGBoost | 66.98% | 77.48% | 24.98% | ~5min |

## Categories

The system classifies articles into 14 categories:
- Politics & Government
- International Affairs & Defense
- Law & Justice
- Economics & Finance
- Trade & Business
- Employment & Labor
- Social Affairs & Health
- Technology & Science
- Transportation
- Environment
- Agriculture & Food
- Energy & Resources
- Industry & Manufacturing
- Geography & Regional

## Tech Stack

- **Backend:** Flask, Python
- **ML/DL:** PyTorch, Transformers (Hugging Face), scikit-learn, XGBoost
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **NLP:** BERT, RoBERTa, TF-IDF, SVD
- **Data:** EURLEX dataset, RSS feeds (CNN, BBC, NYT, Reuters)

## Documentation

For detailed information, see:
- [Full Project Report](Report%20&%20Documentation/NLP_project_report.pdf)
- [Demo Video](Report%20&%20Documentation/Multi_label_News_Article_Classification_Demo.mp4)
- Training notebooks in `Models/` directory
> **Note:** Some files are large (model weights ~498 MB). Download complete project files from:  
> 📂 [Google Drive - Full Project Files](https://drive.google.com/drive/folders/14NDrkxofR6yLsLGD7yAZydWgRvAsQFGC)

## Demo
**Video demonstration:** Check out the full demo video below:
[![Demo Video](https://img.youtube.com/vi/Iv92UFATDrc/maxresdefault.jpg)](https://www.youtube.com/watch?v=Iv92UFATDrc)
*Click the image above to watch the 1-minute demo on YouTube*

---

⭐ If you find this project useful, please consider giving it a star!
