---
title: Arrays, Collections, and Types in PHP
slug: arrays-collections-and-types-in-php
preview: Arrays in PHP are… interesting. But useful. Let me know you a really good use case for arrays as an implementation detail of a collection class…
---

PHP is a very "array" heavy language… wait, let me back up. I put "array" in quotes because arrays in PHP are… not arrays. Well, not in the traditional sense.

A [traditional array] in software is an indexed collection of elements. And traditionally they are at least thought of as the same type of elements in any given array. Some languages don't really enforce that they're the same type, and some do (guess which category PHP falls into with its already non-conforming arrays).

Now, what PHP calls an array is actually a data structure known as a [hash map, a hash table, or a dictionary]. That's because PHP's "array" keys can be pretty much any scalar value ([here's PHP's documentation on "arrays"][PHP Array Documentation]).

PHP's "arrays" will mostly behave like arrays as long as you don't assign keys with the values. PHP will happily increment a numerical index starting at 0 as you assign items to the array.

What we don't have in PHP (to be fair we don't have it in JavaScript either, but I don't know if that's the gold standard we want to be comparing to) is enforcing types in "arrays". And of course, the "array" can be a hash map at any time by simply assigning a key of type string, say, yourself. Any array will accept that. There's nothing you can do about it.

As I said, PHP is very array heavy. Avoiding PHP's "arrays" is pretty much impossible. And I'd also like to note that while I dislike the name because they are not actually arrays, there's nothing wrong with a dictionary data type. It's actually quite useful. The real problem is we don't have real arrays in PHP so we must use a dictionary to accomplish the same thing.

And, I'd also argue that even if we had traditional arrays, we shouldn't be passing them around as transports for data (I'd make the same argument for dictionary types). When you need to pass a collection of data, I think you should use a collection. In PHP, we implement collections as classes. There are libraries that you can use to create collection classes, but I've found every single one of them to be very heavy and overly complicated to use, and yet still don't support all the use cases I often have — at least not easily.

Additionally, most collection libraries want to implement `ArrayAccess` so that they can be treated as arrays. I object to this on a fundamental level. They are not arrays, just call the methods on the collection. That makes things much clearer and easier to read anyway.

And the good news is, building a collection class is pretty trivial. The collection class I'll demonstrate here will utilize PHP "arrays" (or a dictionary) internally. That's what I'll call an internal implementation detail that the outside world need know nothing about.

So, let me show you some code:

```php
readonly class SomeEntity
{
    public function __construct(
        public SomeValueObject $someValueObject,
        public AnotherValueObject $anotherValueObject,
    ) {
    }
}

readonly class SomeEntityCollection
{
    /** @var SomeEntity[] */
    private array $entities;

    /** @param SomeEntity[] $entities */
    public function __construct(array $entities)
    {
        $this->entities = array_map(
            static fn (SomeEntity $entity) => $entity,
            $entities,
        );
    }
}
```

Alright, let me stop there.

Obviously this collection doesn't do anything yet except collect some entities. Once it's collected them, you can't really do much yet. But I do want to point out something I'm doing to work around PHP "arrays" lack of types. We want the collection to only be of one type. The only way the collection gets filled is through the constructor. So immediately in the constructor, we validate the types by iterating over the incoming array and typing the items in the `array_map` callable's typehint. If something is not of the right type, PHP will throw a type exception with that code 👍.

Now, I'm not a fan of writing code that will not yet be in use. That's a little something I like to call premature optimization. So bear that in mind as you write collection classes. But let's say that I have a need to know how many items are in the collection. That's quite simple to add:

```php
readonly class SomeEntityCollection
{
    /** @var SomeEntity[] */
    private array $entities;

    /** @param SomeEntity[] $entities */
    public function __construct(array $entities)
    {
        $this->entities = array_map(
            static fn (SomeEntity $entity) => $entity,
            $entities,
        );
    }

    public function count(): int {
        return count($this->entities);
    }
}
```

Simple.

Now let's see what it might look like to output some json for an API endpoint from a collection.



```php
readonly class SomeEntity
{
    public function __construct(
        public SomeValueObject $someValueObject,
        public AnotherValueObject $anotherValueObject,
    ) {
    }
}

readonly class SomeEntityCollection
{
    /** @var SomeEntity[] */
    private array $entities;

    /** @param SomeEntity[] $entities */
    public function __construct(array $entities)
    {
        $this->entities = array_map(
            static fn (SomeEntity $entity) => $entity,
            $entities,
        );
    }

    public function asJson(): string {
        return (string) json_encode(
            array_map(
                static fn (SomeEntity $entity) => [
                    'someValue' => $entity->someValueObject->toNative(),
                    'anotherValue' => $entity->anotherValueObject->toNative(),
                ]
                $this->entities,
            ),
        );
    }
}
```

This is the beauty of typed, custom collections. When you build it, you know the data, and you can locate the logic to deal with that data where it belongs; with the classes designed to deal with the data. You can put all kinds of methods on these custom collection classes as you need them. You might need to filter, or get the first item, or get the last item, etc. etc. The options are limitless. And it means you write these methods once on the collection, and you can use them anywhere, and they're safe to use because they're well typed and well-defined.

As you can see, PHP's array/dictionary type is useful in implementations. And, as you can see, I typically use it most in collection classes. If you've never considered this before — as I hadn't many years ago when someone introduced me to the idea of not passing arrays around, but using collections — I hope this will inspire you.

[traditional array]: https://en.wikipedia.org/wiki/Array_(data_type)
[hash map, a hash table, or a dictionary]: https://en.wikipedia.org/wiki/Hash_table
[PHP Array Documentation]: https://www.php.net/manual/en/language.types.array.php
