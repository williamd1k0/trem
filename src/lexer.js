const tokenTypes = require("./tokenTypes.js");

const reservedWords = {
    e: tokenTypes.E,
    em: tokenTypes.EM,
    painho: tokenTypes.CLASSE,
    senao: tokenTypes.SENAO,
    mintira: tokenTypes.FALSO,
    para: tokenTypes.PARA,
    breguete: tokenTypes.FUNCAO,
    se: tokenTypes.SE,
    senaose: tokenTypes.SENAOSE,
    uai: tokenTypes.NULO,
    ou: tokenTypes.OU,
    prosa: tokenTypes.ESCREVA,
    arreda: tokenTypes.RETORNA,
    trocinho: tokenTypes.SUPER,
    isto: tokenTypes.ISTO,
    divera: tokenTypes.VERDADEIRO,
    trem: tokenTypes.VAR,
    coisar: tokenTypes.FACA,
    enquanto: tokenTypes.ENQUANTO,
    guenta: tokenTypes.PAUSA,
    bora: tokenTypes.CONTINUA,
    escolha: tokenTypes.ESCOLHA,
    caso: tokenTypes.CASO,
    padrao: tokenTypes.PADRAO,
    rapa: tokenTypes.IMPORTAR,
    peleja: tokenTypes.TENTE,
    lasquera: tokenTypes.PEGUE,
    apia: tokenTypes.FINALMENTE,
    fiidi: tokenTypes.HERDA
};

class Token {
    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return this.type + " " + this.lexeme + " " + this.literal;
    }
}

module.exports = class Lexer {
    constructor(code, Egua) {
        this.Egua = Egua;
        this.code = code;

        this.tokens = [];

        this.start = 0;
        this.current = 0;
        this.line = 1;
    }

    isDigit(c) {
        return c >= "0" && c <= "9";
    }

    isAlpha(c) {
        return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
    }

    isAlphaNumeric(c) {
        return this.isDigit(c) || this.isAlpha(c);
    }

    endOfCode() {
        return this.current >= this.code.length;
    }

    advance() {
        this.current += 1;
        return this.code[this.current - 1];
    }

    addToken(type, literal = null) {
        const text = this.code.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    match(expected) {
        if (this.endOfCode()) {
            return false;
        }

        if (this.code[this.current] !== expected) {
            return false;
        }

        this.current += 1;
        return true;
    }

    peek() {
        if (this.endOfCode()) return "\0";
        return this.code.charAt(this.current);
    }

    peekNext() {
        if (this.current + 1 >= this.code.length) return "\0";
        return this.code.charAt(this.current + 1);
    }

    previous() {
        return this.code.charAt(this.current - 1);
    }

    parseString(stringChar = '"') {
        while (this.peek() !== stringChar && !this.endOfCode()) {
            if (this.peek() === "\n") this.line = +1;
            this.advance();
        }

        if (this.endOfCode()) {
            this.Egua.lexerError(
                this.line,
                this.previous(),
                "Texto não finalizado."
            );
            return;
        }

        this.advance();

        let value = this.code.substring(this.start + 1, this.current - 1);
        this.addToken(tokenTypes.STRING, value);
    }

    parseNumber() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.peek() == "." && this.isDigit(this.peekNext())) {
            this.advance();

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        const fullNumber = this.code.substring(this.start, this.current);
        this.addToken(tokenTypes.NUMBER, parseFloat(fullNumber));
    }

    identifyKeyword() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const c = this.code.substring(this.start, this.current);
        const type = c in reservedWords ? reservedWords[c] : tokenTypes.IDENTIFIER;

        this.addToken(type);
    }

    scanToken() {
        const char = this.advance();

        switch (char) {
            case "[":
                this.addToken(tokenTypes.LEFT_SQUARE_BRACKET);
                break;
            case "]":
                this.addToken(tokenTypes.RIGHT_SQUARE_BRACKET);
                break;
            case "(":
                this.addToken(tokenTypes.LEFT_PAREN);
                break;
            case ")":
                this.addToken(tokenTypes.RIGHT_PAREN);
                break;
            case "{":
                this.addToken(tokenTypes.LEFT_BRACE);
                break;
            case "}":
                this.addToken(tokenTypes.RIGHT_BRACE);
                break;
            case ",":
                this.addToken(tokenTypes.COMMA);
                break;
            case ".":
                this.addToken(tokenTypes.DOT);
                break;
            case "-":
                this.addToken(tokenTypes.MINUS);
                break;
            case "+":
                this.addToken(tokenTypes.PLUS);
                break;
            case ":":
                this.addToken(tokenTypes.COLON);
                break;
            case ";":
                this.addToken(tokenTypes.SEMICOLON);
                break;
            case "%":
                this.addToken(tokenTypes.MODULUS);
                break;
            case "*":
                if (this.peek() === "*") {
                    this.advance();
                    this.addToken(tokenTypes.STAR_STAR);
                    break;
                }
                this.addToken(tokenTypes.STAR);
                break;
            case "!":
                this.addToken(
                    this.match("=") ? tokenTypes.BANG_EQUAL : tokenTypes.BANG
                );
                break;
            case "=":
                this.addToken(
                    this.match("=") ? tokenTypes.EQUAL_EQUAL : tokenTypes.EQUAL
                );
                break;

            case "&":
                this.addToken(tokenTypes.BIT_AND);
                break;

            case "~":
                this.addToken(tokenTypes.BIT_NOT);
                break;

            case "|":
                this.addToken(tokenTypes.BIT_OR);
                break;

            case "^":
                this.addToken(tokenTypes.BIT_XOR);
                break;

            case "<":
                if (this.match("=")) {
                    this.addToken(tokenTypes.LESS_EQUAL);
                } else if (this.match("<")) {
                    this.addToken(tokenTypes.LESSER_LESSER);
                } else {
                    this.addToken(tokenTypes.LESS);
                }
                break;

            case ">":
                if (this.match("=")) {
                    this.addToken(tokenTypes.GREATER_EQUAL);
                } else if (this.match(">")) {
                    this.addToken(tokenTypes.GREATER_GREATER);
                } else {
                    this.addToken(tokenTypes.GREATER);
                }
                break;

            case "/":
                if (this.match("/")) {
                    while (this.peek() != "\n" && !this.endOfCode()) this.advance();
                } else {
                    this.addToken(tokenTypes.SLASH);
                }
                break;

            case " ":
            case "\r":
            case "\t":
                // Ignore whitespace.
                break;

            case "\n":
                this.line += 1;
                break;

            case '"':
                this.parseString('"');
                break;

            case "'":
                this.parseString("'");
                break;

            default:
                if (this.isDigit(char)) this.parseNumber();
                else if (this.isAlpha(char)) this.identifyKeyword();
                else this.Egua.lexerError(this.line, char, "Caractere inesperado.");
        }
    }

    scan() {
        while (!this.endOfCode()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(tokenTypes.EOF, "", null, this.line));
        return this.tokens;
    }
};