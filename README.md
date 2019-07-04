# PostText

> **Note**: This library is still under development! ⚠

## What is PostText?

**PostText** is a markup language and document preparation system. Its aim is to overcome the limitation of Markdown syntax at the minimal cost. PostText provides you with the powerful and expressive editing syntax which can be used in chatting systems, text-editors or storing rich-text in database.

PostText is inspired greatly by Latex, Markdown, XML and other markup languages.

## Features

### Tags

Tags are the most essential building blocks of a PostText document. A tag often consists of four parts:

- Tag name
- Parameters
- Attributes
- Blocks

```
\tag-name () [] {} {}
 1        2  3  4
```

An example of how to use tag to format text in PostText:

```
\title{PostText}

\section{Introduce}

\p {
  Hi! Welcome to \bold{PostText}! \emoji{smile}
}
```

Tag properties can be specified using parameters or attributes. Tag parameters are seperated by commas while tag attributes are seperated by semicolons:

```
\p[
  font-family=Arial, Helvectica, sans-serif;
  font-size=14px;
] {
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
}

\math {
  A = \matrix(2, 3) {
    1   2   3
    -5  7   8
  }
}
```

### Namespaces and Directives

Namespaces provide unique names for tags and attributes from possible extra packages. In additional, a directive - an attribute with namespace - can add more functionalities to the target tag, which makes PostText truely extensible.

```
\use{chart}
\use{highlight}

\chart:pie {
  Apple   30%
  Orange  40%
  Grape   rest
}

\p [highlight:color=yellow] {
  Caution: Please watch your step!
}
```

### Verbatims

Verbatims are non-formatted text blocks without escaping every special characters. Using verbatim is useful when you want to include source code or specify other language section inside PostText.

A verbatim block is specified by prefixing and postfixing the block with the same number of "=" characters. The prefix or postfix length is arbitrary so that PostText is flexible enough to include itself inside code block.

```
\code(javascript) ==={
  function sum(a, b) {
    return a + b
  }

  console.log(sum(5, 6))
}===

\code(posttext) ==={
  \code(posttext) =={
    Nested verbatim block.
  }==
}===
```
