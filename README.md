# FlashCard50
#### Video Demo:  <URL HERE>
#### Description:
### What is it?
FlashCard50 is a web app that helps user to memorise a list of vabularies with a deck of flash cards. 
### How-to
To create a deck of flash cards, import a csv file with two columns of word and definition. 
In csv file, column names must be 'word' and 'definition'.
Once the deck is created, user can review the cards and set difficulty level of each cards.
User will see the word first and guess what the definition of the shown word is. Then, check the answer by revealing the definition. Depending on whether user can guess the definition, there are three difficulty levels can be set by user for each card. 
### Features
There is an option to mute/unmute the sounds of words and definition by clicking speaker buttons. The webapp also allows user to replay the respective sound by clicking play buttons.
On the top-left corner, there is a progress that shows how far the card has completed.
The program is responsive to smaller screens such as mobile and tablets.
User can reset the progress by clicking 'reset' button to start over.
### Audio language
Default audio is in English if user does not include any language setting in the csv file.
To set other languages for audio, .csv file must include another columns named as word_language and def_language, and 
set the column valued as respective language abbreviations - such as fr for french, es for spanish.
### How it works?
By default, each card will display 2 times to the user. By choosing hard, the display time will be increased 1 more time. Setting normal will reduce 1 less time and easy will reduce 2 less time.
Program cache is store in cookies by using the LoDash library.
Data for the deck is stored as json data which is converted from csv by the use of csvtojson library.
When the display count of the card is set to 0, it is identified as completion of that card.
Progress will be saved to cookies everywhen user complete a card.

### TechStacks:
- HTML
- CSS
- Javascript
### Background Idea 
I wanted to create a simple flash card program that doesn't come with a steep learning curve of how to use the tool. 
When user wants to memorize a list of vocabulary, he/she should be able to create a deck quickly without anyhassle of creating a user account or reading a long list of how-to guide. So, I implemented a flash card program that let user import a csv file of a list of vocabulary with a list of word and definition. As soon as the list is imported, user can simply go through the cards and hear the sound of the words. The progress is saved to the browser as cookies so that user can pick up from where he/she left off.
TODO 