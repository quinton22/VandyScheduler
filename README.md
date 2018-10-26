# VandyScheduler
Vandy Scheduler is a Chrome Extension that allows you to easily choose classes that do not have conflicting times, automatically putting them into your cart. It creates all possible schedules based on the classes in your cart, and allows you to choose the schedule that best suits you. It does this by adding all available times of a certain class to the class cart when the "Add to Schedule" button is clicked. You can also choose times that you wish to have no class by clicking the "Preferences" button, and the schedules will be sorted or removed accordingly. Then, it allows you to choose the schedule that works best by clicking the "Make Schedule" button. These classes appear in the class cart. When time to enroll, you can click the "One Click Enroll" button to enroll in all classes in your cart with one click.
## Chrome Web Store
This extension can be downloaded at the Chrome Web Store [here](https://chrome.google.com/webstore/detail/vandy-scheduler/ofkamcklfkpakjddlappmemldnnapina?brand=CHBD&gclid=EAIaIQobChMI46ehtYrS1wIVirbACh19XA8iEAAYASABEgLat_D_BwE&gclsrc=aw.ds&dclid=CP6toraK0tcCFcVnAQodcRQNGA).
## Changelog
- 1.2.2 - Counts laboratory as separate class in the case that a Lecture and Lab have the same class number. Simplified some of the code for removing classes from your cart that are not in your schedule.
- 1.2.1 - Accounting for the change in domain name of the Class Registration Page
- 1.2.0 - Added button to enroll in all class in the class cart with one click. Code courtesy of Samuel Lijin.
- 1.1.1 - Fixed small issue with wrong professor displaying in detailed comment.
- 1.1.0 - Add a preferences button where preferences for break times can be chosen. Simplify the mechanism behind adding and removing classes. Update handling of classes that have different times on different days or are TBA. Showed classes that overlap if schedule does not work.
- 1.0.3 - Edit error message
- 1.0.2 - Edit error message and fix uncaught time overlap
- 1.0.1 - Update description
- 1.0.0 - Initial version
