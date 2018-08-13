from flask import Flask, abort
from flask import render_template, jsonify, request
import json, os, datetime

app = Flask(__name__)
homeUrl = '/'
homeRepo = 'mct'
REPO_CHAR_SET = 'utf-8'
BASE_DIR = '/Users/a80099707/PycharmProjects/jguiadminjson/repo'
DEPLOY_CHAR_SET = 'euckr'
DEPLOY_DIR = '/Users/a80099707/PycharmProjects/jguiadminjson/repo'

@app.route(homeUrl)
def index():
    return render_template('index.html')

@app.route(homeUrl + 'json/<reponame>/<filename>/<version>')
def data_json(reponame, filename, version):
    repo_filename = os.path.join(BASE_DIR, reponame, filename + '.' + version + '.json')
    with open(repo_filename, 'r', encoding=REPO_CHAR_SET) as f:
        data = json.load(f)
    return json.dumps(data).encode('utf-8')

@app.route(homeUrl + 'json/<reponame>/<filename>', methods=['POST'])
def save_json(reponame, filename):
    # print(request.json)
    data = json.dumps(request.json, ensure_ascii=False)
    version = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
    repo_filename = os.path.join(BASE_DIR, reponame, filename + '.' + version + '.json')
    deploy_filename = os.path.join(DEPLOY_DIR, filename + '.json')
    with open(repo_filename, "wb") as f:
        f.write(data.encode(REPO_CHAR_SET))
    with open(deploy_filename, "wb") as f:
        f.write(data.encode(DEPLOY_CHAR_SET))
    return jsonify(version=version)


@app.route(homeUrl + 'json/<reponame>')
def json_listing(reponame):

    # Joining the base and the requested path
    abs_path = os.path.join(BASE_DIR, reponame)

    # Return 404 if path doesn't exist
    if not os.path.exists(abs_path):
        return abort(404)

    # Check if path is a file and serve
    if os.path.isfile(abs_path):
        return abort(404) #send_file(abs_path)

    # Show directory contents
    filelist = []
    for file in os.listdir(abs_path):
        filelist.append(str.split(file, '.')[-2])
    filelist.sort(reverse=True)
    return jsonify(versions=filelist[:10])
    # return render_template('files.html', files=files)

if __name__ == '__main__':
    app.run(debug=True)