import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Copy, Play, Square, Sparkles, Code, Lightbulb, Zap, History, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PythonTranslator = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  const streamingRef = useRef(null);
  const abortControllerRef = useRef(null);

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

  // Load conversation history on component mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const response = await axios.get(`${API}/conversation?session_id=${sessionId}&limit=20`);
      setConversationHistory(response.data);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
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

    setOutput('');
    setIsStreaming(true);
    streamingRef.current = true;
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(`${API}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullOutput += parsed.content;
                setOutput(fullOutput);
              }
              if (parsed.error) {
                toast({
                  title: "Translation Error",
                  description: parsed.error,
                  variant: "destructive"
                });
                break;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Save conversation after successful translation
      if (fullOutput.trim()) {
        await saveConversation(input, fullOutput);
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Translation error:', error);
        toast({
          title: "Translation Failed",
          description: "Failed to translate your request. Please try again.",
          variant: "destructive"
        });
        setOutput('Error: Failed to generate code. Please try again.');
      }
    } finally {
      setIsStreaming(false);
      streamingRef.current = false;
    }
  };

  const handleStop = () => {
    setIsStreaming(false);
    streamingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const saveConversation = async (userInput, pythonOutput) => {
    try {
      const response = await axios.post(`${API}/conversation`, {
        user_input: userInput,
        python_output: pythonOutput,
        session_id: sessionId
      });
      
      // Update local history
      setConversationHistory(prev => [response.data, ...prev]);
      
      toast({
        title: "Success",
        description: "Translation saved to history!",
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save to history, but translation was successful.",
        variant: "destructive"
      });
    }
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
  };

  const loadFromHistory = (conversation) => {
    setInput(conversation.user_input);
    setOutput(conversation.python_output);
    setShowHistory(false);
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API}/conversation/${conversationId}`);
      setConversationHistory(prev => prev.filter(conv => conv.id !== conversationId));
      toast({
        title: "Deleted",
        description: "Conversation deleted from history.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete conversation.",
        variant: "destructive"
      });
    }
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
            Transform your ideas into Python code instantly with AI. Just describe what you want, and watch the magic happen!
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
              Production Ready
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History ({conversationHistory.length})
            </Button>
          </div>
        </div>

        {/* Conversation History */}
        {showHistory && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Conversation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {conversationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No conversation history yet.</p>
                ) : (
                  conversationHistory.map((conversation, index) => (
                    <div key={conversation.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-800 mb-1">
                            {conversation.user_input}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadFromHistory(conversation)}
                            className="text-xs"
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteConversation(conversation.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                <p className="text-gray-600">Get your Python code in seconds with real-time AI streaming</p>
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