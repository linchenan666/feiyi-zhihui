import re
s = open("treasury-real.js", encoding="utf-8").read()
print("HEAD:", s[:180])
print("---KEYS---")
print(re.findall(r'"([a-z]+)":\s*\{name:', s))
