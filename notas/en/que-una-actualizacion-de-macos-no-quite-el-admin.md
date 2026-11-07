---
title: Keeping macOS updates from removing admin rights
date: 2026-11-04
summary: "Every macOS update removed the users' local administrator permission. An Intune script, assigned to a group of users, puts it back on its own. And around it, how we retire a computer with Intune and M365."
tags: [Intune, macOS, Microsoft 365, Entra ID, Endpoint management]
---

Besides servers, I manage computers and users with **Intune**, **Microsoft 365** and **Entra ID**, both for a customer and in our own tenant. In total that's about **100 users**, with around **50 Windows computers** and about **20 Macs**.

## The problem: the admin that disappeared

On the Macs, the local user was added as **administrator of the computer** for **traceability**. Directory integration on macOS isn't great, so we couldn't solve it from there.

It worked, but only until the next macOS update: **the updates removed that permission**, and the user lost administrator access.

## The solution: an Intune script

It was my idea. Instead of granting the permission by hand every time, we put it in an **Intune script** that applies it on its own:

- The script **is assigned in Intune to a specific group of users**. Nothing has to be installed on each Mac.
- If the Mac's local user **matches the pattern** of the users in that group, the script adds it as an administrator.
- If an update removes the permission, the script gives it back.

The result: administrator access became **automated**, and macOS updates stopped leaving anyone locked out.

## Retiring a computer

When someone leaves the company, their computer is prepared for the next person with a fixed procedure:

1. **Disable the user.**
2. **Remove their Microsoft 365 licences.**
3. **Run a wipe from Intune**, which formats the computer and frees it up for a new user.

## Licences and permissions

- **Licences assigned by group** instead of user by user.
- Management of **permissions and users in Entra ID** and in Microsoft 365.
