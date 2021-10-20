import os
import re
import json

#Igbo Tokenizer: to extract Igbo words from scraped articles.
#Developed by Chris Emezue.
# License: MIT


def cleanhtml(raw_html):
    # https://stackoverflow.com/a/12982689/11814682
    #cleanr = re.compile('<.*?>')
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext


def load_json(f):
    with open(f,'r',encoding='utf8') as json_input:
        dict_ = json.load(json_input)
    return dict_['sentences']

def preprocess(w):
    w=w.strip()
    w = cleanhtml(w)
    w = re.sub(r'[0-9]+','',w,flags=re.UNICODE) #remove numbers
    w=re.sub(r'[\n\r\t]+',' ',w)
    w = re.sub(r"[;@#?!&$]+\ *", " ", w)   
    w= re.sub(r'[\․®●□•◆▪©!"★#€■$%&\(\)\*\+,\./:;<=>?@\[\]^_`‘→{|}~«»”“]+','',w)
    w=re.sub(r"^[']",'',w) #remove "'" at the beginning of the word
    w=re.sub(r"[']$",'',w)  #remove "'" at the end of the word
    w = re.sub(r' [ ]+',' ',w)
    
    return w

if __name__ == "__main__":
    files = [f.name for f in os.scandir('./articles')] # get all json files from articles dir.
    files = [os.path.join('./articles',f) for f in files]
    json_files = [load_json(f) for f in files]

    all_files = list(set([a for m in json_files for a in m]))
    long_string = ' '.join(all_files)
    preprocessed_long_string = preprocess(long_string)
    words = preprocessed_long_string.split(' ')
    words = list(set([w.strip() for w in words]))
    with open('./words.json','w+',encoding='utf8') as json_output:
        json.dump(words,json_output,ensure_ascii=False)
    with open('./words.txt','w+',encoding='utf8') as output:
        for word in words:
            output.write(preprocess(word)+'\n')
        
    print(f'ALL DONE. Got {len(words)} words')
    
