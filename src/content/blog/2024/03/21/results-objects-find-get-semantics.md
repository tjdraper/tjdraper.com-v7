---
title: Results Objects and the Semantics of Find vs Get
slug: results-objects-find-get-semantics
preview: How do you keep from passing null around as a value in your software? What is the semantic difference between `find` and `get`? Let me illuminate this subject for you!
---

One thing I'm always after when I'm writing software is to get the semantics right. When you get semantics right, a lot of other things fall into place. Words mean things; they convey concepts and knowledge. And while words can and do change meaning over time with the evolution of language, what we're typically after with using words and language semantically is to choose the best and most precise word possible given the current definitions. This works fairly well because despite what the kids may say these days (please get off my lawn), meaningful language actually changes very slowly.

That works well for us in software because the writing of software involves the use of a lot of words to convey various meanings. And I've found that the more meaningful and precise I try to be with my language in writing software, naming variables and methods and so on, the better off the software is, the more comprehensible and easier to change it is, and the more stable and usable it is.

## "Please find the apple slicer" and "please get the apple slicer" have two different meanings

One of the more recent semantic wrestling matches I've had is fleshing out the difference between "finding" something, and "getting" something [^1]. Until the last couple of years, I've been a little cavalier with the naming of methods in this regard. In some of my older codebases, you might see `findUser` and `getUser` used interchangeably depending on my mood. More recently I've realized that this is a problem as I've tried to get tighter and tighter with the types of things being passed around the system. This led me to start creating methods like `getProduct` and `getProductOrNull`.

[^1]: These types of methods are most often seen on repositories, although certainly not limited to repositories

There are two problems with this approach, but, you know, learning how to make better software is a journey, and being deliberate about this distinction massively improved the quality of my code.

But, to the problems:

Problem 1: now we're passing null around the system. Granted, I've done that plenty in my career, but I'm trying harder and harder not to do that. Still, what do you do if you want to find something, and you expect that it either may or may not exist? I'll actually deal with this problem in a moment.

Problem 2: there's actually already a convention for dealing with getting something concretely, and considering it a program error if the thing doesn't exist, and checking if something exists, and then using it if it does, and doing something else if it doesn't. And that is the `find` vs `get` paradigm. As I've said, this is very semantic.

## Improving the code

Let's start with an example repository.

```php
readonly class ProductRepositoryForPdo implements ProductRepository
{
    public function __construct(
        private ProductTransformer $productTransformer,
        private GetProductByIdFromPdo $getProductByIdFromPdo,
    ) {
    }

    public function getById(string $id): Product
    {
        return $this->productTransformer->recordToEntity(
            $this->getProductByIdFromPdo->get($id)
        );
    }
}
```

This is my basic starting point. I can get a product by ID. But what do I do if I need to get that product by that ID if such a product exists, and not have an error, but do something else if it does not exist? The example method will throw an exception if the product isn't found because of the types. I could do a try/catch in my caller, but, using try/catch for flow control is… bad. Semantically, exceptions are for exceptional cases, for errors. Let's say I have an HTTP endpoint that accepts an ID as one of the parameters in the URL. I don't want an exception, I want to see if the product of the URL ID exists, and render a 404 if not, and a product if it does exist.

My first step of growth was to update the repository in this way:

```php
readonly class ProductRepositoryForPdo implements ProductRepository
{
    public function __construct(
        private ProductTransformer $productTransformer,
        private GetProductByIdFromPdo $getProductByIdFromPdo,
    ) {
    }

    public function getById(string $id): Product
    {
        return $this->productTransformer->recordToEntity(
            $this->getProductByIdFromPdo->get($id)
        );
    }

    public function getByIdOrNull(string $id): Product|null
    {
        $record = $this->getProductByIdFromPdo->getOrNull($id);

        if ($record === null) {
            return null;
        }

        return $this->productTransformer->recordToEntity($record);
    }
}
```

Now the caller can do something like this:

```php
$product = $this->productRepository->getByIdOrNull($id);

if ($product === null) {
    return $this->pageNotFoundResponder->respond();
}

return $this->productPageResponder->respond($product);
```

(I'd probably actually have responder factories and whatnot, but I'm trying to keep these examples simple for readability).

This is clearly better — if not semantically fully realized. But, as I've stated, I think we can make the semantics better. And so I've instead switched to the semantic methods, `findById` and `getById`.

```php
readonly class ProductRepositoryForPdo implements ProductRepository
{
    public function getById(string $id): Product
    {
        // ...
    }

    public function findById(string $id): Product|null
    {
        // ...
    }
}
```

Semantically, that becomes very clear when coupled with the types.

The verb `get` means that you are concretely going to get that thing back. You know the thing exists, and if it doesn't you have a program error, an exceptional circumstance, from which an exception should be thrown.

The verb `find` means that you aren't sure if the thing exists, and you want to find out. You still have pretty solid types in your system, if you're in a circumstance where you _know_ the ID is valid, you can call `get` and you don't have to check it. It will either exist or throw an exception.

## Results Objects

But what do we do about this whole `if ($product === null)` check in the caller?

If you like solid types (and I do), and you like Object-Oriented Programming, (and I do and so should you 🙂), then this feels a little icky. There are two return types coming out of `findById` and that feels a little squishy. Not to mention, one of those return types is a non-object flat value, and the other is an object. And so the caller must then verify that the thing is what we want it to be.

And so my most recent update to my thinking is to return an object from the `find` verb methods, which I have deemed a "Results Object". Here's an example of what that would look like.

The Results Object:

```php
readonly class ProductResult
{
    public bool $hasResult;

    public Product $product;

    public function __construct(Product|null $product = null)
    {
        if ($product === null) {
            $this->hasResult = false;

            /**
             * You could also just leave $this->product un-hydrated, but it
             * would throw an exception if accessed. In that case you _must_
             * check `hasResult` before accessing, which may be fine. It's up
             * to you.
             */
            $this->product = new Product::createEmpty();

            return;
        }

        $this->hasResult = true;

        $this->product = $product;
    }
}
```

Now let's update our repository to fit into this new methodology.

```php
readonly class ProductRepositoryForPdo implements ProductRepository
{
    public function __construct(
        private ProductTransformer $productTransformer,
        private FindProductByIdFromPdo $findProductByIdFromPdo,
    ) {
    }

    public function getById(string $id): Product
    {
        $result = $this->findById($id);

        if (!$result->hasResult) {
            throw new RuntimeException(
                'Product with id ' . $id . ' was not found'
            );
        }

        return $this->productTransformer->recordToEntity($result->product);
    }

    public function findById(string $id): ProductResult
    {
        $recordResult = $this->findProductByIdFromPdo->find($id);

        /**
         * I also updated the PDO service to return its own result object for
         * the record retrieval
         */
        if (! $recordResult->hasResult) {
            return new ProductResult();
        }

        return new ProductResult(
            $this->productTransformer->recordToEntity($recordResult->record)
        );
    }
}
```

And the updated caller:

```php
$result = $this->productRepository->findById($id);

if (! $result->hasResult) {
    return $this->pageNotFoundResponder->respond();
}

return $this->productPageResponder->respond($result->product);
```

This feels much more object-oriented, and tight. All the checks are where they belong. Objects have knowledge about their things and that knowledge doesn't have to be known elsewhere. What's flowing through the system are objects that know about themselves and their data.

That's the way my code, thinking, and semantics have evolved over the last few years in this particular area. If you have any thoughts or addtions, I'd love to have more conversation with you [over on Mastodon].

[over on Mastodon]: https://phpc.social/@tjdraper
