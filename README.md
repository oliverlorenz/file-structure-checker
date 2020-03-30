# file-structure-checker

This tool lets you easily check if a certain file and folder structure is present. The structure to be checked can be configured via a yaml file.

# usage

```
npm install -g file-structure-checker
```

create a `.file-system-checker.yml` file in a directory you want to check. example:

```
vars:
  month: january
structure:
  name: ""
  type: directory
  children:
    - name: correspondence
      type: directory
      children:
        - name: letter.pdf
          type: file
        - name: invoice_${month}.pdf
          type: file
```

run:
```
file-system-checker
```
you will get a result like that:
```
$ file-structure-checker

 /
     ✓ is existing
     ✓ is directory

     /correspondence
         ✓ is existing
         ✓ is directory

         /letter.pdf
             ✕ is existing
             ✕ is file

         /invoice_january.pdf
             ✕ is existing
             ✕ is file

result:
 ✓ 4 ✕ 4
```
