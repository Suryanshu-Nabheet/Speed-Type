export interface WordList {
    name: string;
    category: 'words' | 'sentences' | 'paragraphs' | 'quotes' | 'code';
    difficulty: 'easy' | 'medium' | 'hard';
    content: string[];
    metadata: {
        description: string;
        author?: string;
        tags: string[];
    };
}
export declare class WordListManager {
    private wordListsDir;
    private cache;
    constructor();
    private ensureWordListsDir;
    private loadDefaultWordLists;
    getWordList(name: string): WordList | null;
    getAllWordLists(): WordList[];
    getWordListsByCategory(category: WordList['category']): WordList[];
    getWordListsByDifficulty(difficulty: WordList['difficulty']): WordList[];
    saveWordList(wordList: WordList): void;
    deleteWordList(name: string): void;
    generateText(category: WordList['category'], difficulty: WordList['difficulty'], wordCount: number): string;
    private generateWordsText;
    private generateSentenceText;
    private getDefaultWordLists;
}
//# sourceMappingURL=WordListManager.d.ts.map