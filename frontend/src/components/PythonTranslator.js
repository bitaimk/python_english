import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Copy, Play, Square, Sparkles, Code, Lightbulb, Zap } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { mockTranslations } from '../mock/mockData';

const PythonTranslator = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentExample, setCurrentExample] = useState('');
  const { toast } = useToast();
  const streamingRef = useRef(null);

  const examplePrompts = [
    "Create a function that sorts a list of dictionaries by a specific key",
    "Write a function to find the second largest number in a list",
    "Create a class for a simple calculator with basic operations",
    "Generate code to read a CSV file and convert it to JSON",
    "Write a function that checks if a string is a palindrome",
    "Create a decorator that measures execution time of functions",
    "Write a function to merge two sorted lists",
    "Generate code for a simple web scraper using requests"
  ];

  const simulateStreaming = async (text) => {
    setOutput('');
    setIsStreaming(true);
    
    // Simulate streaming by adding characters one by one
    for (let i = 0; i <= text.length; i++) {
      if (!streamingRef.current) break;
      
      await new Promise(resolve => setTimeout(resolve, 20));
      setOutput(text.slice(0, i));
    }
    
    setIsStreaming(false);
  };

  const handleTranslate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a description of what you want to create in Python.",
        variant: "destructive"
      });
      return;
    }

    // Find matching mock translation or use a default
    const mockTranslation = mockTranslations.find(mock => 
      input.toLowerCase().includes(mock.trigger.toLowerCase())
    );

    const translatedCode = mockTranslation 
      ? mockTranslation.code 
      : `# Generated Python code for: ${input}
def solution():
    """
    ${input}
    """
    # Implementation would go here
    pass

# Example usage:
# solution()`;

    await simulateStreaming(translatedCode);
  };

  const handleStop = () => {
    setIsStreaming(false);
  };

  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Python code copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const useExample = (example) => {
    setInput(example);
    setCurrentExample(example);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Code className="h-12 w-12 text-blue-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              English → Python
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into Python code instantly. Just describe what you want, and watch the magic happen!
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Lightbulb className="h-4 w-4 mr-2" />
              Instant Results
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Code className="h-4 w-4 mr-2" />
              Ready-to-Use
            </Badge>
          </div>
        </div>

        {/* Example Prompts */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Try These Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExample(example)}
                  className="p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Describe Your Python Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: Create a function that sorts a list of dictionaries by a specific key..."
                className="min-h-[200px] text-base resize-none border-2 focus:border-blue-400 transition-colors"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleTranslate} 
                  disabled={isStreaming || !input.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isStreaming ? (
                    <>
                      <Square className="h-5 w-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate Python Code
                    </>
                  )}
                </Button>
                
                {isStreaming && (
                  <Button 
                    variant="outline" 
                    onClick={handleStop}
                    className="px-6 py-6 border-2 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🐍</span>
                Generated Python Code
              </CardTitle>
              {output && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto min-h-[200px] text-sm font-mono border-2 border-gray-700">
                  <code>
                    {output || (isStreaming ? 'Generating Python code...' : 'Your Python code will appear here')}
                    {isStreaming && (
                      <span className="animate-pulse bg-blue-500 text-blue-500 ml-1">|</span>
                    )}
                  </code>
                </pre>
                {!output && !isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Enter a description and click "Generate Python Code"</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Lightning Fast</h3>
                <p className="text-gray-600">Get your Python code in seconds, not minutes</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Lightbulb className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Smart Translation</h3>
                <p className="text-gray-600">AI understands your intent and generates optimal code</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Code className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Production Ready</h3>
                <p className="text-gray-600">Clean, well-structured code ready for your projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PythonTranslator;