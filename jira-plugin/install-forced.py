#!/usr/bin/env python3
import pexpect
import os

os.environ["FORGE_EMAIL"] = "robertoschmidt2706@gmail.com"
os.environ["FORGE_API_TOKEN"] = (
    "ATATT3xFfGF0oaVbuwB950ewdl7ndJDuQ7KzNlb1_SCybFdy6iIf1Yx39fwLuWtXuExeB3eAu5-1AJoZ8tN9y-ZnT6NaENfW0AJOwwvhbCaF46nWxq6DPseOiv4-6bIxFPYv5Y_u14YVSX2mpVyt7NhxLguP3RnafdPMmT9ygday0y7WLYEXYxo=9BA1B6F1"
)

child = pexpect.spawn(
    "forge install -s robertoschmidt.atlassian.net -p jira --confirm-scopes",
    env=os.environ,
    encoding="utf-8",
)
try:
    child.expect("Are you sure you want to proceed?", timeout=20)
    child.sendline("y")
    child.expect(pexpect.EOF, timeout=60)
    print(child.before or "")
except pexpect.TIMEOUT:
    print("Timeout - prompt not found")
print("\nDone!")
