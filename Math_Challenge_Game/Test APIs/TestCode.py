import openai
openai.api_key = ""
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Solve 10 + 5"}],
    max_tokens=10
)
print(response)
