from flask import Flask, render_template, jsonify
import feedparser
from utils import predict_labels, parse_rss_feeds
from datetime import datetime

app = Flask(__name__)

# List of RSS feed URLs
RSS_FEEDS = [
    'http://rss.cnn.com/rss/edition.rss',
    'http://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.reuters.com/reuters/topNews',
]

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/api/news')
def get_news():
    """Fetch and classify news articles"""
    try:
        articles = parse_rss_feeds(RSS_FEEDS)
        
        # Predict labels for each article
        for article in articles:
            article['predicted_labels'] = predict_labels(article['title'], article['description'])
        
        return jsonify({
            'success': True,
            'articles': articles,
            'total': len(articles)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/categories')
def get_categories():
    """Get available categories"""
    categories = [
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
    return jsonify({'categories': categories})

if __name__ == '__main__':
    app.run(debug=True, port=5000)