from flask import Response
from flask import Flask
from flask import jsonify
from json import dumps
from nltk.corpus import wordnet as wn

app = Flask(__name__)

abstracts = None

def ABSTRACT():
  global abstracts
  if abstracts == None: abstracts = set([x for a in [
  "abstract_entity",
  "abstraction",
  "attribute",
  "state",
  "entity",
  "state"
  "act",
  "deed",
  "event",
  "human action",
  "human activity",
  "psychological_feature",
  "activity"
  "object",
  "physical entity",
  "physical object",
  "unit",
  "whole"]
  for x in wn.synsets(a)
  ])
  return abstracts

@app.route('/')
def hello_world():
    return 'see /<word>/definitions or /<word>/synonyms ...'

@app.route('/<word>/definitions')
@app.route('/<word>/def')
@app.route('/<word>/d')
def define(word):
  word = word.replace(" ", "_")
  return Response(dumps(defs(word), indent=3), content_type='application/json')

@app.route('/<word>/synonyms')
@app.route('/<word>/syn')
@app.route('/<word>/s')
def syn(word):
  word = word.replace(" ", "_")
  return Response(dumps(names(syns(word)), indent=3), content_type='application/json')

def syns(q): return set(wn.synsets(q) +  [x for y in wn.synsets(q) for x in  set(
  set(y.closure(lambda a: a.hypernyms(), depth=3)) |
  set(y.closure(lambda a: a.hyponyms(), depth=3)) |
  set(y.closure(lambda a: a.hyponyms() + a.similar_tos(), depth=3))
)]) - ABSTRACT()

def defs(q): return [l.definition for l in wn.synsets(word)]
def names(q): return sorted(set([x.replace("_"," ") for l in q for x in l.lemma_names ]))

if __name__ == '__main__':
    import os
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 3000)))
