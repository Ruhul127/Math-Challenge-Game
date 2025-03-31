from flask import Flask, render_template, request, jsonify
import random
import openai
import logging
from itertools import combinations, permutations
from operator import add, sub, mul, truediv
import time
import re

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Set OpenAI API key (replace with your actual key)
openai.api_key = ""
if not openai.api_key:
    raise ValueError("OpenAI API key not found.")

def generate_solvable_numbers():
    """Generates a target number and a list of 6 numbers that can reach the target."""
    try:
        operations = [add, sub, mul, truediv]
        op_symbols = ['+', '-', '*', '/']
        
        for _ in range(10):
            target = random.randint(100, 1000)
            numbers = [random.randint(5, 30) for _ in range(6)]
            
            for r in [3, 4]:
                for num_comb in combinations(numbers, r):
                    for num_perm in permutations(num_comb):
                        for op_comb in permutations(op_symbols, len(num_perm)-1):
                            try:
                                result = num_perm[0]
                                for i in range(len(op_comb)):
                                    if op_comb[i] == '+':
                                        result += num_perm[i+1]
                                    elif op_comb[i] == '-':
                                        result -= num_perm[i+1]
                                    elif op_comb[i] == '*':
                                        result *= num_perm[i+1]
                                    elif op_comb[i] == '/':
                                        result /= num_perm[i+1]
                                
                                if abs(result - target) < 0.0001:
                                    return target, numbers
                            except ZeroDivisionError:
                                continue
        
        target = 250
        numbers = [10, 10, 5, 25, 2, 3]
        return target, numbers
        
    except Exception as e:
        logging.error(f"Error generating numbers: {e}")
        return None, None

def brute_force_solution(target, numbers):
    """Attempts to find a solution using brute force with basic operations."""
    operations = [add, sub, mul, truediv]
    op_symbols = ['+', '-', '*', '/']
    
    for r in range(3, min(7, len(numbers) + 1)):
        for num_comb in combinations(numbers, r):
            for num_perm in permutations(num_comb):
                for op_comb in permutations(op_symbols, len(num_perm)-1):
                    try:
                        equation = str(num_perm[0])
                        result = num_perm[0]
                        
                        for i in range(len(op_comb)):
                            equation += f" {op_comb[i]} {num_perm[i+1]}"
                            if op_comb[i] == '+':
                                result += num_perm[i+1]
                            elif op_comb[i] == '-':
                                result -= num_perm[i+1]
                            elif op_comb[i] == '*':
                                result *= num_perm[i+1]
                            elif op_comb[i] == '/':
                                result /= num_perm[i+1]
                        
                        if abs(result - target) < 0.0001:
                            return f"{equation} = {target}"
                    except ZeroDivisionError:
                        continue
    return None

def validate_solution(solution, target, numbers):
    """Validates that a solution string correctly reaches the target using the given numbers."""
    try:
        equation_part = solution.split('=')[0].strip()
        used_numbers = [int(num) for num in re.findall(r'\d+', equation_part)]
        for num in used_numbers:
            if num not in numbers:
                return False
        
        if equation_part.count('(') != equation_part.count(')'):
            return False
        
        result = eval(equation_part)
        return abs(result - target) < 0.0001
    except:
        return False

def format_solution_with_parentheses(solution):
    """Ensures the solution has proper parentheses formatting for clarity."""
    try:
        parts = solution.split('=')
        if len(parts) != 2:
            return solution
            
        equation = parts[0].strip()
        target = parts[1].strip()
        
        if '(' in equation or ')' in equation:
            return solution
            
        if '*' in equation or '/' in equation:
            ops = [op for op in equation.split() if op in '+-*/']
            if len(ops) > 2:
                tokens = equation.split()
                new_tokens = []
                i = 0
                while i < len(tokens):
                    if tokens[i] in '*/':
                        if i > 0 and i < len(tokens)-1:
                            new_tokens[-1] = f"({new_tokens[-1]} {tokens[i]} {tokens[i+1]})"
                            i += 2
                        else:
                            new_tokens.append(tokens[i])
                            i += 1
                    else:
                        new_tokens.append(tokens[i])
                        i += 1
                equation = ' '.join(new_tokens)
        
        return f"{equation} = {target}"
    except:
        return solution

def get_solution_from_openai(target, numbers):
    """Calls the OpenAI API to generate a solution for the given target and numbers."""
    brute_solution = brute_force_solution(target, numbers)
    if brute_solution:
        return format_solution_with_parentheses(brute_solution)
    
    max_attempts = 3
    attempt = 0
    
    while attempt < max_attempts:
        try:
            prompt = f"""
            You are a math tutor helping with a number puzzle game. 
            The target number is {target}. 
            The available numbers are: {', '.join(map(str, numbers))}.
            
            Rules:
            1. Use between 3 to 6 of the available numbers
            2. Only use basic operations: +, -, *, /
            3. You MUST use parentheses for grouping when operations would be ambiguous
            4. The equation must exactly equal the target number
            
            Provide ONLY the final equation in this exact format:
            [number] [operation] [number] ... = [target]
            
            Example with parentheses: (25 * 25) + (8 + 6) = 639
            Example without: 25 * 10 + 5 * 2 = 260
            
            Important: The equation must evaluate to exactly {target} when calculated
            with standard order of operations. Include parentheses where needed to
            ensure the operations are performed in the correct order.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a math tutor. Provide only the final equation that reaches the target number using the given numbers, with parentheses where needed for correct order of operations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.1
            )
            
            solution = response.choices[0].message['content'].strip()
            solution = solution.split('\n')[0].strip()
            formatted_solution = format_solution_with_parentheses(solution)
            
            if validate_solution(formatted_solution, target, numbers):
                return formatted_solution
            
            attempt += 1
            time.sleep(1)
            
        except Exception as e:
            logging.error(f"Error getting solution from OpenAI (attempt {attempt}): {e}")
            attempt += 1
            time.sleep(1)
    
    return "Unable to find a valid solution. Try different operations with your numbers."

@app.route('/')
def home():
    """Renders the home page with game functionality"""
    try:
        target, numbers = generate_solvable_numbers()
        if target is None or numbers is None:
            return render_template('error.html', message="Error generating numbers. Please try again."), 500
        return render_template('index.html', target=target, numbers=numbers)
    except Exception as e:
        logging.error(f"Error in home route: {e}")
        return render_template('error.html', message="An error occurred. Please try again."), 500
    
@app.route('/about')
def about():
    """Renders the about page"""
    try:
        return render_template('about.html')
    except Exception as e:
        logging.error(f"Error in about route: {e}")
        return render_template('error.html', message="An error occurred. Please try again."), 500

@app.route('/check', methods=['POST'])
def check():
    """Validates the user's result and returns the difference from the target."""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        user_result = data.get("user_result")
        target = data.get("target")
        numbers = data.get("numbers")

        if target is None or numbers is None:
            return jsonify({"error": "Missing data"}), 400

        if user_result is None:
            hint = get_solution_from_openai(target, numbers)
            return jsonify({"difference": None, "hint": hint})

        if not isinstance(user_result, (int, float)):
            return jsonify({"error": "Invalid user result"}), 400

        difference = abs(user_result - target)
        hint = get_solution_from_openai(target, numbers)

        return jsonify({"difference": difference, "hint": hint})
    except Exception as e:
        logging.error(f"Error in check route: {e}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

if __name__ == '__main__':
    app.run(debug=True)