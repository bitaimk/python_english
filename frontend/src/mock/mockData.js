export const mockTranslations = [
  {
    trigger: "sort list dictionaries",
    code: `def sort_dict_list(dict_list, key):
    """
    Sort a list of dictionaries by a specific key.
    
    Args:
        dict_list: List of dictionaries to sort
        key: Key to sort by
    
    Returns:
        Sorted list of dictionaries
    """
    return sorted(dict_list, key=lambda x: x.get(key, 0))

# Example usage:
students = [
    {'name': 'Alice', 'age': 25, 'grade': 'A'},
    {'name': 'Bob', 'age': 22, 'grade': 'B'},
    {'name': 'Charlie', 'age': 27, 'grade': 'A+'}
]

# Sort by age
sorted_by_age = sort_dict_list(students, 'age')
print(sorted_by_age)`
  },
  {
    trigger: "second largest number",
    code: `def find_second_largest(numbers):
    """
    Find the second largest number in a list.
    
    Args:
        numbers: List of numbers
    
    Returns:
        Second largest number or None if not found
    """
    if len(numbers) < 2:
        return None
    
    # Remove duplicates and sort in descending order
    unique_numbers = sorted(set(numbers), reverse=True)
    
    return unique_numbers[1] if len(unique_numbers) > 1 else None

# Example usage:
numbers = [5, 2, 8, 1, 9, 3, 9, 4]
second_largest = find_second_largest(numbers)
print(f"Second largest: {second_largest}")  # Output: 8`
  },
  {
    trigger: "calculator class",
    code: `class Calculator:
    """
    A simple calculator class with basic operations.
    """
    
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        """Add two numbers."""
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def subtract(self, a, b):
        """Subtract two numbers."""
        result = a - b
        self.history.append(f"{a} - {b} = {result}")
        return result
    
    def multiply(self, a, b):
        """Multiply two numbers."""
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result
    
    def divide(self, a, b):
        """Divide two numbers."""
        if b == 0:
            raise ValueError("Cannot divide by zero")
        result = a / b
        self.history.append(f"{a} / {b} = {result}")
        return result
    
    def get_history(self):
        """Get calculation history."""
        return self.history
    
    def clear_history(self):
        """Clear calculation history."""
        self.history.clear()

# Example usage:
calc = Calculator()
print(calc.add(10, 5))      # 15
print(calc.multiply(3, 4))  # 12
print(calc.divide(20, 4))   # 5.0
print(calc.get_history())   # Show all calculations`
  },
  {
    trigger: "csv to json",
    code: `import csv
import json

def csv_to_json(csv_file_path, json_file_path=None):
    """
    Convert CSV file to JSON format.
    
    Args:
        csv_file_path: Path to the CSV file
        json_file_path: Path to save JSON file (optional)
    
    Returns:
        List of dictionaries representing the CSV data
    """
    data = []
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            for row in csv_reader:
                data.append(row)
        
        # Save to JSON file if path provided
        if json_file_path:
            with open(json_file_path, 'w', encoding='utf-8') as json_file:
                json.dump(data, json_file, indent=2, ensure_ascii=False)
        
        return data
    
    except FileNotFoundError:
        print(f"Error: CSV file '{csv_file_path}' not found")
        return []
    except Exception as e:
        print(f"Error converting CSV to JSON: {e}")
        return []

# Example usage:
# Convert CSV to JSON
json_data = csv_to_json('data.csv', 'output.json')
print(f"Converted {len(json_data)} rows to JSON")`
  },
  {
    trigger: "palindrome",
    code: `def is_palindrome(text):
    """
    Check if a string is a palindrome (reads the same forwards and backwards).
    
    Args:
        text: String to check
    
    Returns:
        Boolean indicating if text is a palindrome
    """
    # Remove spaces and convert to lowercase for comparison
    cleaned = ''.join(text.lower().split())
    
    # Remove non-alphanumeric characters
    cleaned = ''.join(char for char in cleaned if char.isalnum())
    
    # Compare with reversed string
    return cleaned == cleaned[::-1]

def is_palindrome_recursive(text, start=0, end=None):
    """
    Check if a string is a palindrome using recursion.
    
    Args:
        text: String to check
        start: Starting index
        end: Ending index
    
    Returns:
        Boolean indicating if text is a palindrome
    """
    if end is None:
        end = len(text) - 1
    
    # Base case: if start >= end, we've checked all characters
    if start >= end:
        return True
    
    # If characters don't match, not a palindrome
    if text[start].lower() != text[end].lower():
        return False
    
    # Recursively check the next pair
    return is_palindrome_recursive(text, start + 1, end - 1)

# Example usage:
test_strings = ["racecar", "hello", "A man a plan a canal Panama", "race a car"]

for string in test_strings:
    result = is_palindrome(string)
    print(f"'{string}' is palindrome: {result}")`
  },
  {
    trigger: "execution time decorator",
    code: `import time
import functools

def measure_time(func):
    """
    Decorator that measures the execution time of a function.
    
    Args:
        func: Function to measure
    
    Returns:
        Wrapped function with timing
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        
        print(f"{func.__name__} executed in {execution_time:.4f} seconds")
        return result
    
    return wrapper

# Alternative decorator with more detailed output
def detailed_timer(unit='seconds'):
    """
    Decorator factory for measuring execution time with different units.
    
    Args:
        unit: Time unit ('seconds', 'milliseconds', 'microseconds')
    
    Returns:
        Decorator function
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            result = func(*args, **kwargs)
            end_time = time.perf_counter()
            
            execution_time = end_time - start_time
            
            if unit == 'milliseconds':
                execution_time *= 1000
                unit_symbol = 'ms'
            elif unit == 'microseconds':
                execution_time *= 1_000_000
                unit_symbol = 'μs'
            else:
                unit_symbol = 's'
            
            print(f"{func.__name__} took {execution_time:.4f} {unit_symbol}")
            return result
        
        return wrapper
    return decorator

# Example usage:
@measure_time
def slow_function():
    """A function that takes some time to execute."""
    time.sleep(1)
    return "Done!"

@detailed_timer(unit='milliseconds')
def fast_function():
    """A quick function."""
    return sum(range(1000))

# Test the decorated functions
result1 = slow_function()  # Will print execution time
result2 = fast_function()  # Will print execution time in milliseconds`
  },
  {
    trigger: "merge sorted lists",
    code: `def merge_sorted_lists(list1, list2):
    """
    Merge two sorted lists into one sorted list.
    
    Args:
        list1: First sorted list
        list2: Second sorted list
    
    Returns:
        Merged sorted list
    """
    merged = []
    i = j = 0
    
    # Compare elements from both lists and add smaller one
    while i < len(list1) and j < len(list2):
        if list1[i] <= list2[j]:
            merged.append(list1[i])
            i += 1
        else:
            merged.append(list2[j])
            j += 1
    
    # Add remaining elements from list1
    while i < len(list1):
        merged.append(list1[i])
        i += 1
    
    # Add remaining elements from list2
    while j < len(list2):
        merged.append(list2[j])
        j += 1
    
    return merged

def merge_multiple_sorted_lists(lists):
    """
    Merge multiple sorted lists into one sorted list.
    
    Args:
        lists: List of sorted lists
    
    Returns:
        Merged sorted list
    """
    if not lists:
        return []
    
    result = lists[0]
    
    for i in range(1, len(lists)):
        result = merge_sorted_lists(result, lists[i])
    
    return result

# Example usage:
list1 = [1, 3, 5, 7, 9]
list2 = [2, 4, 6, 8, 10]
list3 = [0, 11, 12]

# Merge two lists
merged_two = merge_sorted_lists(list1, list2)
print(f"Merged two lists: {merged_two}")

# Merge multiple lists
all_lists = [list1, list2, list3]
merged_all = merge_multiple_sorted_lists(all_lists)
print(f"Merged all lists: {merged_all}")`
  },
  {
    trigger: "web scraper",
    code: `import requests
from bs4 import BeautifulSoup
import time
import csv
from urllib.parse import urljoin, urlparse

class WebScraper:
    """
    A simple web scraper using requests and BeautifulSoup.
    """
    
    def __init__(self, delay=1):
        self.session = requests.Session()
        self.delay = delay  # Delay between requests (be respectful)
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_page(self, url):
        """
        Get a webpage and return BeautifulSoup object.
        
        Args:
            url: URL to scrape
        
        Returns:
            BeautifulSoup object or None if failed
        """
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def scrape_links(self, url, base_url=None):
        """
        Scrape all links from a webpage.
        
        Args:
            url: URL to scrape
            base_url: Base URL for relative links
        
        Returns:
            List of links
        """
        soup = self.get_page(url)
        if not soup:
            return []
        
        links = []
        base_url = base_url or url
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            links.append({
                'text': link.get_text(strip=True),
                'url': full_url
            })
        
        return links
    
    def scrape_text(self, url, selector=None):
        """
        Scrape text content from a webpage.
        
        Args:
            url: URL to scrape
            selector: CSS selector for specific elements
        
        Returns:
            Extracted text
        """
        soup = self.get_page(url)
        if not soup:
            return ""
        
        if selector:
            elements = soup.select(selector)
            return ' '.join(elem.get_text(strip=True) for elem in elements)
        else:
            return soup.get_text(strip=True)
    
    def scrape_to_csv(self, urls, filename, selector=None):
        """
        Scrape multiple URLs and save to CSV.
        
        Args:
            urls: List of URLs to scrape
            filename: Output CSV filename
            selector: CSS selector for content
        """
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['URL', 'Title', 'Content'])
            
            for url in urls:
                soup = self.get_page(url)
                if soup:
                    title = soup.find('title')
                    title_text = title.get_text(strip=True) if title else "No title"
                    
                    content = self.scrape_text(url, selector)
                    writer.writerow([url, title_text, content[:500]])  # Limit content
                
                time.sleep(self.delay)  # Be respectful

# Example usage:
scraper = WebScraper(delay=2)

# Scrape links from a webpage
links = scraper.scrape_links('https://example.com')
print(f"Found {len(links)} links")

# Scrape text content
text = scraper.scrape_text('https://example.com', selector='p')
print(f"Extracted text: {text[:200]}...")

# Scrape multiple URLs to CSV
urls = ['https://example.com/page1', 'https://example.com/page2']
scraper.scrape_to_csv(urls, 'scraped_data.csv')`
  }
];