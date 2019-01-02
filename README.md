# PostText

The next generation markup language for everyone!

## What is PostText?

PostText is a markup language and text-preprocessing system. Its syntax is based on Latex. Its aim is to overcome the limitation of Markdown syntax but still keep the simplicity and readability. The final target is to provide the user with a powerful content editing format without the need of any advanced WYSIWYG editor.

## Why?

- **Simple** - PostText syntax is simple.
- **Flexible** - PostText can handle wide range of syntaxes.
- **Extensible** - PostText features are extensible.
- **Fault Tolerance** - Syntactic errors can only affect one part of the document but not the whole document.

## How it work?

A document written in PostText will be processed by a PostText preprocessor and transformed into Abstract Syntax Tree (AST). The AST then will be consumed by editors, web-based renderers or other rendering systems. These renderers will provide theme, layout and render the content into the final form.

## Example

Text using PostText syntax:

```
= section[] Post Text

== subtitle[] Introduce

=== paragraph

Hello, \bold{World}!

Math Equation:

=== math

\matrix(2, 3){
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
