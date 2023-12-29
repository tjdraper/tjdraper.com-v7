---
title: Enumerate The Options
slug: enumerate-the-options
preview: Enumerating options in your code can provide clarity of intent and ease of use. Let me show you an example from some work I've been doing…
---

I've recently been participating in a [Strangler Fig] re-write of an application formerly based on Drupal 7. Well, I say formerly, but Drupal is still powering a lot of the app's API (this is the point of the Strangler Fig pattern). We previously re-built the front-end in React and turned the Drupal business logic portion of the app into an API that serves endpoints to the front-end. Now we're re-writing the Drupal app in our own custom PHP application (well, custom, but the web framework is using [Slim]) one API endpoint at a time. Our new PHP application is talking directly to Drupal's database. We're taking over the databse, essentially. And once Drupal goes away, we can do whatever we want to the schema. It's a starting point for our evolution of the applicaiton.

We recently came across a need to get field values from a Drupal database table to make decisions about the app. The short story is, we have entities in Drupal to which Drupal fields are attached. Those fields can be set to values that control the behavior of that entity on the front-end. So when we get that entity, we need to check the field values for various aspects of the front-end and API output.

Initially in this new PHP app, we created an object-oriented way of getting the values that we needed into a custom collection class which was returned by the repository. That collection class looked something like this:

```php
class InstanceVariableCollection
{
    /** @var InstanceVariableRecord[] */
    private array $records;

    /** @param InstanceVariableRecord[] $records */
    public function __construct(array $records = [])
    {
        $this->records = [];

        foreach ($records as $record) {
            $this->records[$record->field_variables_key] = $record;
        }
    }

    public function getValue(string $key): string {
        return $this->records[$key]->field_variables_value;
    }
}
```

This is fine as far as it goes. That class is populated with the appropriate data and returned from our repository. And we can get values out by key. Thus, we have replicated the functional way that Drupal 7 does it in a more object-oriented way.

But we weren't completely satisfied with this. There are a number of issues here that we can address to make this class both easier to use and more safe.

First of all, we know what the keys are because they're pre-determined field names. But the caller doesn't know what those names are in our code. What happens if we call a key that doesn't exist. We're going to have an unrecoverable exception. Naturally, we hope we don't run into that. Surely we'd test this in dev, run into an exception for a field that doesn't exist, and fix it. But applications do not run on hope. Suppose that data isn't in the database in production? There's nothing saying it HAS to be there.

With those things in mind, there are two things we can do to make this code safer and easier to use at the same time.

Let's start with enumerating our known keys. There's no reason to use a string as the key of known possible values. That just makes the caller guess at what a legal value is. We can modify our code to use enums in this manner:

```php
enum InstanceVariableKeys: string
{
    case DISABLE_FEATURE_1 = 'disable_feature_1';
    case DISABLE_FEATURE_2 = 'disable_feature_2';
    case INSTANCE_NAME = 'instance_name';
    case INSTANCE_PER_PAGE = 'instance_per_page';
}

class InstanceVariableCollection
{
    /** @var InstanceVariableRecord[] */
    private array $records;

    /** @param InstanceVariableRecord[] $records */
    public function __construct(array $records = [])
    {
        $this->records = [];

        foreach ($records as $record) {
            $this->records[$record->field_variables_key] = $record;
        }
    }

    public function getValue(InstanceVariableKeys $key): string {
        return $this->records[$key->value]->field_variables_value;
    }
}
```

We now have an enum that enumerates the possible known values that the key can be. This both takes the guess work out of calling the `getValue` method and allows us to inspect a list of values to know what we might be after.

But we haven't yet solved the problem of what to do about trying to get a key that may not exist in the databse but our application thinks it should. Since we know all the keys, we can also know what the defaults should be, at least in this case. There may be cases where you would want to throw an exception if a value was missing from the database, but I will not demonstrate that here because that was not the case in the code we were working with. I will just note that you'll want to modify your code to throw a custom exception with relevant information about what went wrong rather than letting PHP throw an exception about a missing array key that will be harder to debug and track down due to its generic-ness.

In this case, we decided to provide some defaults for cases where a value might not exist in the database. Here's what that looks like:

```php
enum InstanceVariableKeys: string
{
    case DISABLE_FEATURE_1 = 'disable_feature_1';
    case DISABLE_FEATURE_2 = 'disable_feature_2';
    case INSTANCE_NAME = 'instance_name';
    case INSTANCE_PER_PAGE = 'instance_per_page';

    public function defaultValue()
    {
        return match($this) {
            InstanceVariableKeys::DISABLE_FEATURE_1 => false,
            InstanceVariableKeys::DISABLE_FEATURE_2 => false,
            InstanceVariableKeys::INSTANCE_NAME => '',
            InstanceVariableKeys::INSTANCE_PER_PAGE => 20,
        }
    }
}

class InstanceVariableCollection
{
    /** @var InstanceVariableRecord[] */
    private array $records;

    /** @param InstanceVariableRecord[] $records */
    public function __construct(array $records = [])
    {
        $this->records = [];

        foreach ($records as $record) {
            $this->records[$record->field_variables_key] = $record;
        }
    }

    public function getValue(InstanceVariableKeys $key): string
    {
        return $this->records[$key->value]->field_variables_value ?? $key->defaultValue();
    }
}
```

With that update, we should never get a thrown exception from our `getValue` method because we know all the values that the keys can be, and we've made sure they all have defaults. But there's one further refinement we can make here. You may have noticed that all the variables are string values coming from the database, but we have things like `disable_feature_1`. The string that comes back from the database is `(string) 0` or `(string) 1`. What we really want to do in those cases is convert that to boolean. Right now it's on the caller to then do a string compare against `'0'` or `'1'` or cast to boolean. And we also have possible integer values coming out of the database as strings.

To make our collection a little smarter, let's break it up a little like this:

```php
enum InstanceVariableKeysString: string
{
    case INSTANCE_NAME = 'instance_name';
    
    public function defaultValue(): string
    {
        return match($this) {
            InstanceVariableKeys::INSTANCE_NAME => '',
        }
    }
}

enum InstanceVariableKeysBoolean: string
{
    case DISABLE_FEATURE_1 = 'disable_feature_1';
    case DISABLE_FEATURE_2 = 'disable_feature_2';

    public function defaultValue(): bool
    {
        return match($this) {
            InstanceVariableKeys::DISABLE_FEATURE_1 => false,
            InstanceVariableKeys::DISABLE_FEATURE_2 => false,
        }
    }
}

enum InstanceVariableKeysInteger: string
{
    case INSTANCE_PER_PAGE = 'instance_per_page';

    public function defaultValue(): int
    {
        return match($this) {
            InstanceVariableKeys::INSTANCE_PER_PAGE => 20,
        }
    }
}

class InstanceVariableCollection
{
    /** @var InstanceVariableRecord[] */
    private array $records;

    /** @param InstanceVariableRecord[] $records */
    public function __construct(array $records = [])
    {
        $this->records = [];

        foreach ($records as $record) {
            $this->records[$record->field_variables_key] = $record;
        }
    }

    public function getString(InstanceVariableKeysString $key): string
    {
        return $this->getValue($key);
    }

    public function getBoolean(InstanceVariableKeysBoolean $key): bool
    {
        return (bool) $this->getValue($key);
    }

    public function getInteger(InstanceVariableKeysInteger $key): int
    {
        return (int) $this->getValue($key);
    }

    private function getValue(
        InstanceVariableKeysString|InstanceVariableKeysBoolean|InstanceVariableKeysInteger $key
    ): string|bool|int {
        return $this->records[$key->value]->field_variables_value ?? $key->defaultValue();
    }
}
```

Now we have solid types coming out of our collection class because we already know what each value's type should be.

You could argue that there's a better database design, and you'd be right. This is not the way I'd design the data in persistence. But this is the system we have. And what we've done is encapsulated the responsibility of dealing with the data idiosyncrasies as best we can, in the safest manner we can for the system we're working with. We now have very safe code giving out properly typed values that we can work with on the other side. The caller need not know all the silly stuff. It can get the value of one of the enumerated keys and be on its merry way.

And we've made it really easy to know what the legal values are. This makes the system easy to use, and easy to maintain. And we made the intention of each key very clear with types.

I hope therefore that this inspires you to think about ways to make your code clear and future use easy with enumeration.

[Strangler Fig]: /blog/strangler-fig-mindset/
[Slim]: https://www.slimframework.com/
