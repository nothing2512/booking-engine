'use strict';

const
    /**@type {typeof import('../../Models/Book')} */
    Book = use('App/Models/Book'),

    /**@type {typeof import('../../Models/Category')} */
    Category = use('App/Models/Category'),

    /**@type {typeof import('../../Helpers/Uploader')} */
    Uploader = use('App/Helpers/Uploader'),

    /**@type {typeof import('../../Helpers/Engine')} */
    Engine = use('App/Helpers/Engine');

/**
 * Book Controller
 *
 * @class BookController
 */
class BookController {

    /**
     * update queued books order
     *
     * @method queue
     * @async
     *
     * @param models
     * @param counter
     * @returns {Promise<void>}
     */
    async queue(models, counter) {
        for (const item of models) {
            let book = await Book.find(item.id);
            book.merge({index: item.index + counter});
            await book.save()
        }
    }

    /**
     * get all books
     *
     * @method index
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async index({request, response}) {
        let page = request.input('page', 1);
        let category_id = request.input('category_id');
        const books = [];

        let book = Book.query()
            .orderBy('index', 'asc');

        if (!isNaN(category_id) && category_id != "") book = book.where('category_id', category_id);

        const payloads = Object.assign({
            status: true,
            message: ""
        }, await book.paginate(page));

        for (let item of payloads.rows) {
            item.category = await Category.find(item.category_id);
            books.push(item)
        }

        payloads.rows = books;

        return response.json(payloads)
    }

    /**
     * show book detail
     *
     * @method show
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async show({params, response}) {
        let book = await Book.find(params.id);
        if (book == null) return response.notFound(Engine.title("book"));

        book.chapters = await book.chapters()
            .orderBy('index', 'asc')
            .fetch();

        book.category = await Category.find(book.category_id);

        return response.success(book)
    }

    /**
     * create book
     *
     * @method store
     * @async
     *
     * @param request
     * @param response
     * @returns {Promise<void|*>}
     */
    async store({request, response}) {
        const payloads = request.all();
        const category = await Category.find(payloads.category_id);
        if (category == null) return response.notFound("Kategori");

        payloads.image = await Uploader.book(request.file("image"));

        const book = await Book.create(payloads);
        book.category = category;

        return response.success(book)
    }

    /**
     * update book
     *
     * @method update
     * @async
     *
     * @param request
     * @param response
     * @param params
     * @returns {Promise<void|*>}
     */
    async update({request, response, params}) {
        const index = request.input('index');

        const book = await Book.find(params.id);
        if (book == null) return response.notFound(Engine.title("book"));

        const payloads = request.all();
        const category = await Category.find(payloads.category_id);
        if (category == null) return response.notFound("Kategori");

        if (!isNaN(index)) {
            if (index > book.index) {
                const books = await Book.query()
                    .where('index', '<=', index)
                    .where('index', '>', book.index)
                    .fetch();
                await this.queue(books.toJSON(), -1)
            } else if (index < book.index) {
                const books = await Book.query()
                    .where('index', '>=', index)
                    .where('index', '<', book.index)
                    .fetch();
                await this.queue(books.toJSON(), 1)
            }
        }

        const image = await Uploader.book(request.file("image"));
        if (image != null) payloads.image = image;

        book.merge(payloads);
        await book.save();

        book.category = category;

        return response.success(book)
    }

    /**
     * delete book
     *
     * @method destroy
     * @async
     *
     * @param params
     * @param response
     * @returns {Promise<void|*>}
     */
    async destroy({params, response}) {
        const book = await Book.find(params.id);
        if (book !== null) {
            await book.delete();
            const books = await Book.query()
                .where('index', '>', book.index)
                .fetch();
            await this.queue(books.toJSON(), -1)
        }
        return response.success(null)
    }
}

module.exports = BookController;
