const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Load environment variables manually
function loadEnv() {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    const env = {};
    lines.forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
            const [key, ...values] = line.split('=');
            env[key.trim()] = values.join('=').trim();
        }
    });
    return env;
}

async function testModels() {
    try {
        const env = loadEnv();
        const apiKey = env.GEMINI_API_KEY;
        console.log('Using API key:', apiKey.substring(0, 20) + '...');
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Test different model names
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'text-embedding-004',
            'gemini-1.0-pro',
            'models/gemini-pro',
            'models/text-embedding-004'
        ];
        
        console.log('\n🧪 Testing available models:\n');
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`Testing: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                if (modelName.includes('embedding')) {
                    // Test embedding model
                    const result = await model.embedContent('test');
                    console.log(`✅ ${modelName} - Embedding dimensions: ${result.embedding.values.length}`);
                } else {
                    // Test generative model
                    const result = await model.generateContent('Hello');
                    console.log(`✅ ${modelName} - Working`);
                }
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message.split(':')[0]}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testModels();
