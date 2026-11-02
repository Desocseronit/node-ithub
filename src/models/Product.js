class Product {

    static allInstances = {};

    static idGenerator = Product.idGeneratorFn();

    static get idNext() {
        return Product.idGenerator.next().value;
    }

    static * idGeneratorFn() {
        let i = 0;
        while (true) yield i++;
    }

    _id;
    get id() { return this._id; }

    name;
    price;
    category;
    stock = 0;
    description = null;
    imageUrl = null;
    createdAt;

    constructor({ name, price, category, stock, description = null, imageUrl = null }) {
        this._id = Product.idNext;
        this.name = name;
        this.price = price;
        this.category = category;
        this.stock = stock > 0 ? stock : 0;
        this.description = description;
        this.imageUrl = imageUrl;
        this.createdAt = Date.now();

        Product.allInstances[this.id] = this
    }

    get info() {
        return {
            id: this.id,
            name : this.name,
            price: this.price,
            category: this.category,
            stock: this.stock,
            description: this.description,
            imageUrl: this.imageUrl,
            createdAt: this.createdAt

        }
    }
}

module.exports = Product;