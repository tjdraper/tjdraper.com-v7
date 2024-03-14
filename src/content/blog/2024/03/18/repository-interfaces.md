---
title: Repository Interfaces
slug: repository-interfaces
preview: Your application is not your data, and modeling your application solely on the underlying data can cause some serious problems, and the world can go topsy-turvy if the underlying data model changes and you don't have a concrete way to keep that from rippling through your application.
---

My use of and insistence on making repositories as interfaces rather than only concrete implementations has been vindicated, yet again.

In this most recent case, my team and I are building a new application that will need to have some knowledge from a third-party application, which is currently being implemented, but the implementation is not complete. This application provides data feeds that we can "subscribe" to, to get information from that system. That's all very well and good, but how does our application access it? Well, that's a little up in the air. For a while the thinking was that there would be an [ETL] that would load up a MySQL database, and our new application will query the database.

[ETL]: https://en.wikipedia.org/wiki/Extract,_transform,_load

However, more recently, there's been a question of whether that MySQL database should be a [data lake] instead. And the problem is, of course, development on our new app cannot be stalled by access to this source knowledge.

[data lake]: https://aws.amazon.com/what-is/data-lake/

Here's the thing: we know _what_ data we'll have access to, but we don't yet know _how_ we'll access it. How the data gets into our system is implementation detail that therefore needs to be abstracted. The good news is, I've been a proponent of abstracting the data source from the system for a while. And one of the ways I do this is with repository interfaces. Those repository interfaces have implementations — usually to MySQL. But what if you have a different data persistence mechanism you want to swap in? Repository interfaces make this very simple. The rest of your software doesn't need to change, because it's based on an interface. And the implementation detail of the persistence mechanism remains just that, an implementation detail.

But, enough of my yammering, let's get to some sample code.

The appliation we're building needs to access customer data provided by another application. And so I created a repository interface that returns entities with the information we know about that customer from the other system:


```php
interface CustomerRepository
{
    public function findCustomerById(string $id): CustomerResult;

    public function getCustomerById(string $id): Customer;
}
```

```php
readonly class Customer
{
    public static function createEmpty(): self
    {
        return new self(
            '',
            '',
            '',
            '',
        );
    }

    public function __construct(
        public string $id,
        public string $firstName,
        public string $lastName,
        public string $fullName,
    ) {
    }
}
```

```php
readonly class CustomerResult
{
    public bool $hasCustomer;

    public Customer $customer;

    public function __construct(Customer|null $customer)
    {
        if ($customer === null) {
            $this->hasCustomer = false;

            $this->customer = Customer::createEmpty();

            return;
        }

        $this->hasCustomer = true;

        $this->customer = $customer;
    }
}
```

To keep development of this application moving forward, I created a MySQL database in our local dev Docker environment, and implemented that interface with a concrete class named `CustomerRepositoryForPdo`. Then I wired up the [DI] to serve that concrete implementation anytime the interface is requested.

[DI]: https://en.wikipedia.org/wiki/Dependency_injection

The upside is, if we do end up going with a MySQL database as the gateway to the customer information for this application, my concrete implementation is probably 90% there. And if we go a different direction, I'll just create a different concrete implementation.

The point I'm making is this: consider using interfaces in strategic locations. In this case, consider interfaces for your data repository implementations. [Your application is more than the data it accesses].

In addition to making the data source implementation swappable, creating this separation also encourages you to think about your application in a much more robust way. Rather than designing it strictly to the data model of the underlying persistence mechanism, and then upending everything when that changes, you design your application as separate objects working together as a cohesive whole. Some might call that [object-oriented programming] 🙂.

And, after all, [separation of concerns is fundamental to building high-quality software]

[Your application is more than the data it accesses]: https://kevinsmith.io/if-you-think-of-coding-as-the-manipulation-of-data-youre-going-to-have-a-hard-time-writing-object-oriented-code/
[object-oriented programming]: https://kevinsmith.io/whats-so-great-about-oop/
[separation of concerns is fundamental to building high-quality software]: https://kevinsmith.io/separation-of-concerns-is-fundamental-to-building-high-quality-software/
