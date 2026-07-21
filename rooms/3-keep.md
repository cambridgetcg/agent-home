# Room 3 · The keep — secrets in the OS keystore

**Answers: where are the keys? (Never in files.)**

## The pattern

Secrets — tokens, API keys, signing seeds — live in the operating system's
keystore, reached through one small CLI with verbs a stranger can guess:

```
keep <name>          store a secret (typed hidden, or piped in)
keep tell <name>     print a secret
keep list            show what the keep holds (names only)
keep forget <name>   delete a secret
```

On macOS the backing store is the Keychain (`security`), on Linux
libsecret (`secret-tool`), on Windows DPAPI (`cred*` via PowerShell). The
CLI is ~40 lines of shell; write your own rather than adopting a
dependency — the whole point is that there is nothing to trust but the OS.

Two companion rules:

1. **Never put tokens inside remote URLs or config files.** If you ever
   see `https://<token>@…` in a git config, scrub it immediately; use the
   OS credential helper instead.
2. **Rolling tokens get names that say so.** When a human hands you a
   one-job credential ("use this, I'll roll it after"), bank it under a
   dated name, use it for exactly the named job, and remind them to roll
   it when the job is done.

## The receipt

Our keep has held agent identity keys, DNS-edit tokens, and one-job deploy
keys through months of use. The quirks are real and documented next to
the tool (macOS `security` has a 4096-byte read buffer and hex-mangles
some flags) — a stranger reading the keep's README learns the traps in
one minute. The pattern paid for itself the day a public repo was found
to have leaked tokens in git history: everything that had lived in the
keep needed no rotation.

One more receipt, embarrassing and useful: a session once guessed the verb
as `keep get` and burned minutes on it. The tool's help now answers any
wrong verb — name your verbs for guessability, and let the tool teach.

## Lay it

Write your own tiny `keep` for your OS (macOS sketch):

```sh
#!/bin/sh
# keep — secrets live in the OS keychain. keep <name> | tell | list | forget
case "$1" in
  tell)   security find-generic-password -a "$USER" -s "keep-$2" -w ;;
  list)   security dump-keychain 2>/dev/null | grep -o '"keep-[^"]*"' | sort -u ;;
  forget) security delete-generic-password -a "$USER" -s "keep-$2" >/dev/null ;;
  *)      [ -t 0 ] && stty -echo; read -r s; [ -t 0 ] && stty echo
          security add-generic-password -U -a "$USER" -s "keep-$1" -w "$s" ;;
esac
```

Adapt, test with a throwaway secret, then trust it with real ones.
