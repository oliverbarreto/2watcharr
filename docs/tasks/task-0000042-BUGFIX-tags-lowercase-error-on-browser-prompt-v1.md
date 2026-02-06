# BUGFIX: ERROR on browser console

After deploying the app to the server, the tags feature works fine, but I am getting these errors on the browser console in `https://2watcharr.oliverbarreto.com/settings` in the `Tags Management` tab:

bootstrap-autofill-overlay.js:22021 Uncaught (in promise) TypeError: node.tagName.toLowerCase is not a function
    at CollectAutofillContentService.isNodeFormFieldElement (bootstrap-autofill-overlay.js:22021:42)
    at CollectAutofillContentService.<anonymous> (bootstrap-autofill-overlay.js:22155:27)
    at Generator.next (<anonymous>)
    at bootstrap-autofill-overlay.js:21205:71
    at new Promise (<anonymous>)
    at collect_autofill_content_service_awaiter (bootstrap-autofill-overlay.js:21201:12)
    at buildAutofillFieldItem (bootstrap-autofill-overlay.js:22154:50)
    at bootstrap-autofill-overlay.js:1292:53

bootstrap-autofill-overlay.js:1428 Uncaught (in promise) TypeError: element.tagName.toLowerCase is not a function
    at elementIsInstanceOf (bootstrap-autofill-overlay.js:1428:54)
    at elementIsFormElement (bootstrap-autofill-overlay.js:1468:12)
    at nodeIsFormElement (bootstrap-autofill-overlay.js:1519:35)
    at bootstrap-autofill-overlay.js:21986:17
    at DomQueryService.buildTreeWalkerNodesQueryResults (bootstrap-autofill-overlay.js:9272:17)
    at DomQueryService.queryAllTreeWalkerNodes (bootstrap-autofill-overlay.js:9250:14)
    at DomQueryService.query (bootstrap-autofill-overlay.js:9110:25)
    at CollectAutofillContentService.queryAutofillFormAndFieldElements (bootstrap-autofill-overlay.js:21985:54)
    at CollectAutofillContentService.<anonymous> (bootstrap-autofill-overlay.js:21468:62)
    at Generator.next (<anonymous>)


Analyze the reason why we get this error. Next are the tags we have in production. Some of them start with capital letter and some don't. Some have emojis. We let the user pick the tag name.
- Claude Code
- Domótica
- OpenClawd
- Personal Development
- Podcast
- Politics
- Productivity Tools
- Typescript
- arr
- 💵 Finanzas
- 🤖 ai
- 🧪homelab