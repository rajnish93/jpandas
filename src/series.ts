export class Series {
    private data: any[];
    private index: any[];

    constructor(data: any[] | object, index?: any[]) {
        if (Array.isArray(data)) {
            this.data = data;
            if (index) {
                if (data.length !== index.length) {
                    throw new Error("Data and index must have the same length.");
                }
                this.index = index;
            } else {
                this.index = Array.from(Array(data.length).keys());
            }
        } else if (typeof data === 'object' && data !== null) {
            this.index = Object.keys(data);
            this.data = Object.values(data);
        } else {
            throw new Error("Data must be an array or an object.");
        }
    }

    head(n: number = 5): Series {
        if (n < 0) {
            throw new Error("Number of elements cannot be negative.");
        }
        return new Series(this.data.slice(0, n), this.index.slice(0, n));
    }

    tail(n: number = 5): Series {
        if (n < 0) {
            throw new Error("Number of elements cannot be negative.");
        }
        if (n === 0) {
            return new Series([], []);
        }
        return new Series(this.data.slice(-n), this.index.slice(-n));
    }

    toArray(): any[] {
        return this.data;
    }

    toString(): string {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            result += `${this.index[i]}\t${this.data[i]}\n`;
        }
        return result;
    }
}
