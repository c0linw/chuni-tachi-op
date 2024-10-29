import sqlite3
import json

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

with open('chunithm-player-data-sun.json', 'r', encoding='utf-8') as file:
    data = json.load(file)
    print("score data successfully loaded from json")

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
    print("Input SQL queries against the imported data, or type 'exit' to quit:")
    
    while True:
        prompt = input()
        if prompt == 'exit':
            break

        try:
            db.execute(prompt)
            result = db.fetchall()
            print(result)
        except sqlite3.OperationalError as e:
            print(e)
            continue