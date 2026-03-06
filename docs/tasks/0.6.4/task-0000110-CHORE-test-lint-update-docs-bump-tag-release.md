bump to version 0.6.4

---

## v2

we had a problem with the command "/update-tag-release.md" during the last two release.
in 0.6.3 you modified CHANGELOG.md correctly and forgot to modify roadmap. Now in 0.6.4 you modified roadmap correctly and forgot to modify CHANGELOG.md.

Fix it 

Thought for 1s
Analyzing Workflow Failure

I'm currently investigating the repeated failure of the /update-tag-release.md workflow. My latest focus is pinpointing why CHANGELOG.md updates are missed, despite the roadmap being updated, specifically in version 0.6.4. I believe I have the start of some evidence but need to dig deeper.

Analyzed
docs/specs/roadmap
Analyzed
~/local/dev/2watcharr
Error while analyzing directory
Cannot list directory

workflows
which does not exist.
Analyzed
.agent/workflows
Analyzed

CHANGELOG.md#L1-335
Analyzed

roadmap.md#L1-221

Thought for 2s
Analyzing the Changelog

I've zeroed in on the CHANGELOG.md file, and I've found a couple of key problems. First, the entry for version 0.6.3 is formatted incorrectly; it's missing a bracket and uses a date instead of just the version number. More critically, the changelog is entirely MISSING the entry for version 0.6.4, an omission that requires immediate attention.

Analyzed

update-tag-release.md#L1-51
Analyzed

package.json#L1-67

Thought for 7s
Updating Version and History

I've just bumped package.json to 0.6.4. My next task is to update the changelog and roadmap. Specifically, I'm adjusting the changelog format to ## [0.6.3] - 2026-03-06 and I will add an entry for version 0.6.4.

Edited

CHANGELOG.md
+11
-5
Edited

roadmap.md
+6
-0

Thought for 2s


Edited

update-tag-release.md
+3
-2

Thought for <1s
Confirming Workflow Fix

I've addressed the initial issue by correcting the files and the workflow, and am ready to implement the changes. Now, I will confirm with the user regarding the scope of the fix and whether to commit the changes, given the initial prompt was simply "Fix it". I believe the intention is to commit the fixes to the codebase. Specifically, the CHANGELOG.md was updated.

I have fixed the issues with the documentation files and updated the release workflow to prevent these omissions in the future.

Summary of Changes
Updated 

CHANGELOG.md
:
Added the missing 0.6.4 release entry.
Fixed the formatting of the 0.6.3 entry (previously used an incorrect header format).
Updated 

roadmap.md
:
Restored the missing 0.6.3 release entry under the "Implemented Features" section.
Improved Release Workflow:
Modified 

update-tag-release.md
 to explicitly state that BOTH 

CHANGELOG.md
 and 

roadmap.md
 must be updated before proceeding.
Added a CRITICAL warning to ensure documentation accuracy before committing.
Verified Files

CHANGELOG.md

roadmap.md

.agent/workflows/update-tag-release.md
Both release entries for 0.6.3 and 0.6.4 are now correctly synchronized across both files.