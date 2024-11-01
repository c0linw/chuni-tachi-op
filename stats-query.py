import sqlite3
import json
from tabulate import tabulate

con = sqlite3.connect("chuni.db")
db = con.cursor()

db.execute("drop table if exists pbs")
db.execute('''create table pbs (
           chart_id varchar(64) primary key, 
           song_id int,
           score int,
           jcrit int,
           justice int,
           attack int,
           miss int,
           lamp varchar(32),
           grade varchar(8),
           lamp_enum int,
           grade_enum int)''')

db.execute("drop table if exists songs")
db.execute('''create table songs (
           id int primary key,
           title varchar(128),
           artist varchar(128),
           display_version varchar(32),
           genre varchar(32))''')

db.execute("drop table if exists charts")
db.execute('''create table charts (
           chart_id varchar(64) primary key,
           difficulty varchar(16),
           level varchar(8),
           level_num double,
           song_id int)''')

with open('chunithm-player-data-sun.json', 'r', encoding='utf-8') as file:
    data = json.load(file)
    print("data successfully loaded from json")

    db.executemany('insert into songs values (?, ?, ?, ?, ?)', 
                   [(
                       song['id'],
                       song['title'],
                       song['artist'],
                       song['data']['displayVersion'],
                       song['data']['genre']
                   ) for song in data['songs']])
    db.execute("select count(1) from songs")
    result = db.fetchone()
    print(f"{result[0]} songs successfully imported")

    db.executemany('insert into charts values (?, ?, ?, ?, ?)', 
                   [(
                       chart['chartID'],
                       chart['difficulty'],
                       chart['level'],
                       chart['levelNum'],
                       chart['songID']
                   ) for chart in data['charts']])
    db.execute("select count(1) from charts")
    result = db.fetchone()
    print(f"{result[0]} charts successfully imported")

    db.executemany('insert into pbs values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                   [(
                       pb['chartID'],
                       pb['songID'],
                       pb['scoreData']['score'],
                       pb['scoreData']['judgements']['jcrit'],
                       pb['scoreData']['judgements']['justice'],
                       pb['scoreData']['judgements']['attack'],
                       pb['scoreData']['judgements']['miss'],
                       pb['scoreData']['lamp'],
                       pb['scoreData']['grade'],
                       pb['scoreData']['enumIndexes']['lamp'],
                       pb['scoreData']['enumIndexes']['grade']
                   ) for pb in data['pbs']])
    
    db.execute("select count(1) from pbs")
    result = db.fetchone()
    print(f"{result[0]} scores successfully imported\n")

    # create view to pre-join song/chart data with pbs for easier querying
    db.execute('create view scores as select s.title, s.artist, s.genre, c.level_num, p.score, p.jcrit, p.justice, p.attack, p.miss, p.lamp, p.grade from songs s join charts c on s.id = c.song_id join pbs p on c.chart_id = p.chart_id')
    print("Input SQL queries against the imported data, or type 'exit' to quit:")
    
    while True:
        prompt = input()
        if prompt == 'exit':
            break

        try:
            db.execute(prompt)
            result = db.fetchall()
            print(tabulate(result))
        except sqlite3.OperationalError as e:
            print(e)
            continue
