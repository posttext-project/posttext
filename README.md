# PostText

The next generation markup language for everyone!

> **Note**: This library is still under development! ⚠

## What is PostText?

**PostText** is a markup language and text preprocessor based on Latex. Its aim is to overcome the limitation in Markdown syntax but still keep the readability. The final target is to provide the user with a powerful content editing format without the need of any advanced WYSIWYG editor.

## Why?

- **Readability** - The rules are simple and easy to read and write.
- **Extensibility** - Features can be added and be modified easily without a lot of changes.
- **Flexibility** - It can handle other language syntax at minimum cost. 
- **Fault Tolerance** - Syntactic error can only affect one part of the document but not the whole document.

## How it work?

Given a document written in PostText, the preprocessor will process and transform the document and return the AST of the document. Postprocessing systems like HTML generator will provide the templates and render the given AST to the final form. 

## Example

Text using PostText syntax:

```
= title [] Post Text

== subsection [] Introduce

=== paragraph

Hello, \bold{World}!

Math Equation:

=== math

\matrix(2, 3) {
  1   9   -13
  20  5   -6
}
```

Corresponding HTML produced by a PostText processor:

```html
<h1>Post Text</h1>

<h2>Introduce</h2>

<p>Hello, <b>World</b>!</p>

<p>Math Equation:</p>

<math>
  <mrow>
    <mo>[</mo>
    <mtable>
      <mtr>
        <mtd><mi>1</mi></mtd> <mtd><mi>9</mi></mtd>
        <mtd><mi>-13</mi></mtd>
      </mtr>
      <mtr>
        <mtd><mi>20</mi></mtd> <mtd><mi>5</mi></mtd>
        <mtd><mi>-6</mi></mtd>
      </mtr>
    </mtable>
    <mo>]</mo>
  </mrow>
</math>
```
