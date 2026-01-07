import feedparser
from datetime import datetime
import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Define all possible labels (matching your training order)
ALL_LABELS = [
    "Politics & Government",
    "International Affairs & Defense",
    "Law & Justice",
    "Economics & Finance",
    "Trade & Business",
    "Employment & Labor",
    "Social Affairs & Health",
    "Technology & Science",
    "Transportation",
    "Environment",
    "Agriculture & Food",
    "Energy & Resources",
    "Industry & Manufacturing",
    "Geography & Regional"
]

# Global variables for model and tokenizer (loaded once)
_model = None
_tokenizer = None
_device = None


def load_model(model_path="./Models/roberta/model_weights"):
    """Load the trained model and tokenizer once"""
    global _model, _tokenizer, _device
    
    if _model is None:
        print(f"Loading model from {model_path}...")
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _tokenizer = AutoTokenizer.from_pretrained(model_path)
        _model = AutoModelForSequenceClassification.from_pretrained(model_path)
        _model.to(_device)
        _model.eval()
        print(f"Model loaded successfully on {_device}")
    
    return _model, _tokenizer, _device


def get_all_labels():
    """Return list of all possible labels"""
    return ALL_LABELS


def predict_labels(title, description, threshold=0.5):
    """
    Predict labels for a given news article using trained RoBERTa model
    
    Args:
        title (str): Article title
        description (str): Article description/summary
        threshold (float): Probability threshold for predictions (default: 0.5)
    
    Returns:
        list: List of predicted category labels
    """
    try:
        # Load model if not already loaded
        model, tokenizer, device = load_model()
        
        # Combine title and description
        text = f"{title} {description}"
        
        # Tokenize input
        inputs = tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
        
        # Move inputs to device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
        # Apply sigmoid to get probabilities
        probs = torch.sigmoid(logits).cpu().numpy()[0]
        
        # Get labels above threshold
        predicted_labels = [ALL_LABELS[i] for i, prob in enumerate(probs) if prob > threshold]
        
        # If no labels predicted, return the top label
        if len(predicted_labels) == 0:
            top_idx = probs.argmax()
            predicted_labels = [ALL_LABELS[top_idx]]
        
        return predicted_labels
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        # Return empty list on error
        return []


def parse_rss_feeds(feed_urls):
    """
    Parse multiple RSS feeds and extract article information
    
    Args:
        feed_urls (list): List of RSS feed URLs
    
    Returns:
        list: List of article dictionaries
    """
    articles = []
    
    for feed_url in feed_urls:
        try:
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries[:10]:  # Limit to 10 articles per feed
                article = {
                    'title': entry.get('title', 'No Title'),
                    'description': clean_html(entry.get('summary', entry.get('description', ''))),
                    'link': entry.get('link', '#'),
                    'published': format_date(entry.get('published', '')),
                    'source': feed.feed.get('title', 'Unknown Source')
                }
                articles.append(article)
        except Exception as e:
            print(f"Error parsing feed {feed_url}: {str(e)}")
            continue
    
    return articles


def clean_html(text):
    """Remove HTML tags from text"""
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    return text.strip()


def format_date(date_string):
    """Format date string to readable format"""
    if not date_string:
        return datetime.now().strftime('%Y-%m-%d %H:%M')
    
    try:
        dt = datetime.strptime(date_string, '%a, %d %b %Y %H:%M:%S %Z')
        return dt.strftime('%Y-%m-%d %H:%M')
    except:
        return date_string