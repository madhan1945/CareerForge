import sys
sys.path.append('.')
from app.nlp.preprocessor import ResumePreprocessor
import pandas as pd

df = pd.read_csv('../data/raw/Resume/Resume.csv')
p = ResumePreprocessor()
result = p.full_pipeline(df['Resume_str'].iloc[0])
print('Skills:', result['skills'][:5])
print('Education:', result['education'])
print('Experience:', result['experience_years'])
print('Word Count:', result['word_count'])
print('All good!')