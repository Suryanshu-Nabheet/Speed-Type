import fs from 'fs';
import path from 'path';
import os from 'os';
export class WordListManager {
    constructor() {
        this.cache = new Map();
        this.wordListsDir = path.join(os.homedir(), '.speed-type', 'wordlists');
        this.ensureWordListsDir();
        this.loadDefaultWordLists();
    }
    ensureWordListsDir() {
        if (!fs.existsSync(this.wordListsDir)) {
            fs.mkdirSync(this.wordListsDir, { recursive: true });
        }
    }
    loadDefaultWordLists() {
        const defaultWordLists = this.getDefaultWordLists();
        defaultWordLists.forEach(wordList => {
            const filePath = path.join(this.wordListsDir, `${wordList.name}.json`);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify(wordList, null, 2));
            }
            this.cache.set(wordList.name, wordList);
        });
    }
    getWordList(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }
        const filePath = path.join(this.wordListsDir, `${name}.json`);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const wordList = JSON.parse(content);
                this.cache.set(name, wordList);
                return wordList;
            }
            catch (error) {
                console.error(`Failed to load word list ${name}:`, error);
                return null;
            }
        }
        return null;
    }
    getAllWordLists() {
        const wordLists = [];
        try {
            const files = fs.readdirSync(this.wordListsDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const name = path.basename(file, '.json');
                    const wordList = this.getWordList(name);
                    if (wordList) {
                        wordLists.push(wordList);
                    }
                }
            });
        }
        catch (error) {
            console.error('Failed to read word lists directory:', error);
        }
        return wordLists;
    }
    getWordListsByCategory(category) {
        return this.getAllWordLists().filter(wl => wl.category === category);
    }
    getWordListsByDifficulty(difficulty) {
        return this.getAllWordLists().filter(wl => wl.difficulty === difficulty);
    }
    saveWordList(wordList) {
        const filePath = path.join(this.wordListsDir, `${wordList.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(wordList, null, 2));
        this.cache.set(wordList.name, wordList);
    }
    deleteWordList(name) {
        const filePath = path.join(this.wordListsDir, `${name}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        this.cache.delete(name);
    }
    generateText(category, difficulty, wordCount) {
        const wordLists = this.getAllWordLists().filter(wl => wl.category === category && wl.difficulty === difficulty);
        if (wordLists.length === 0) {
            throw new Error(`No word lists found for category ${category} and difficulty ${difficulty}`);
        }
        const wordList = wordLists[Math.floor(Math.random() * wordLists.length)];
        if (category === 'words') {
            return this.generateWordsText(wordList, wordCount);
        }
        else {
            return this.generateSentenceText(wordList, wordCount);
        }
    }
    generateWordsText(wordList, wordCount) {
        const words = [...wordList.content];
        const result = [];
        for (let i = 0; i < wordCount; i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            result.push(word);
        }
        return result.join(' ');
    }
    generateSentenceText(wordList, targetWordCount) {
        const sentences = [...wordList.content];
        let result = '';
        let currentWordCount = 0;
        while (currentWordCount < targetWordCount && sentences.length > 0) {
            const sentence = sentences[Math.floor(Math.random() * sentences.length)];
            const sentenceWordCount = sentence.split(/\s+/).length;
            if (currentWordCount + sentenceWordCount <= targetWordCount * 1.1) { // 10% tolerance
                if (result)
                    result += ' ';
                result += sentence;
                currentWordCount += sentenceWordCount;
            }
            else {
                break;
            }
        }
        return result || sentences[0] || 'Hello world';
    }
    getDefaultWordLists() {
        return [
            {
                name: 'common-words-easy',
                category: 'words',
                difficulty: 'easy',
                content: [
                    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
                    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'how',
                    'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
                    'its', 'let', 'put', 'say', 'she', 'too', 'use'
                ],
                metadata: {
                    description: 'Common English words for beginners',
                    tags: ['common', 'basic', 'english']
                }
            },
            {
                name: 'programming-keywords',
                category: 'code',
                difficulty: 'medium',
                content: [
                    'function', 'return', 'if', 'else', 'for', 'while', 'const', 'let', 'var',
                    'class', 'extends', 'import', 'export', 'default', 'async', 'await',
                    'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'public',
                    'private', 'protected', 'interface', 'type', 'enum', 'namespace'
                ],
                metadata: {
                    description: 'Programming keywords and reserved words',
                    tags: ['programming', 'keywords', 'code']
                }
            },
            {
                name: 'inspirational-quotes',
                category: 'quotes',
                difficulty: 'medium',
                content: [
                    'The only way to do great work is to love what you do.',
                    'Innovation distinguishes between a leader and a follower.',
                    'Your time is limited, so don\'t waste it living someone else\'s life.',
                    'Stay hungry, stay foolish.',
                    'The future belongs to those who believe in the beauty of their dreams.',
                    'It is during our darkest moments that we must focus to see the light.',
                    'Success is not final, failure is not fatal: it is the courage to continue that counts.'
                ],
                metadata: {
                    description: 'Inspirational quotes from famous people',
                    author: 'Various',
                    tags: ['quotes', 'inspiration', 'motivation']
                }
            },
            {
                name: 'lorem-ipsum',
                category: 'paragraphs',
                difficulty: 'medium',
                content: [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
                ],
                metadata: {
                    description: 'Lorem ipsum placeholder text',
                    tags: ['lorem', 'ipsum', 'placeholder']
                }
            }
        ];
    }
}
