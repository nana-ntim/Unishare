# Simple Git Guide for UniShare

This guide provides the essential Git commands and workflow for the UniShare project.

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/unishare.git
cd unishare

# Create a new branch for your work
git checkout -b feature/auth-testing
```

## Daily Workflow

```bash
# Before starting work, pull the latest changes
git pull origin main

# Check status of your changes
git status

# Add files to be committed
git add tests/unit/ResendVerification.test.jsx
# Or add all changes
git add .

# Commit your changes with a descriptive message
git commit -m "Add tests for ResendVerification component"

# Push your changes to the remote repository
git push origin feature/auth-testing
```

## Creating a Pull Request

1. Go to the GitHub repository in your browser
2. Click on "Pull Requests" > "New Pull Request"
3. Select your branch (`feature/auth-testing`)
4. Add a title and description for your changes
5. Submit the pull request for review

## Best Practices

1. **Keep commits focused**: Each commit should represent a single logical change
2. **Write clear commit messages**: Start with a verb in present tense (e.g., "Add", "Fix", "Update")
3. **Pull regularly**: Keep your branch up-to-date with the main branch
4. **Create separate branches**: Use a new branch for each feature or bug fix
5. **Run tests before committing**: Make sure all tests pass before pushing changes

## Common Git Commands

```bash
# See what branch you're on and what files are changed
git status

# Create a new branch
git checkout -b branch-name

# Switch to an existing branch
git checkout branch-name

# View commit history
git log

# Discard changes in a file
git checkout -- filename

# Temporarily stash changes
git stash
git stash pop  # to bring them back

# Merge main branch into your feature branch
git checkout feature/auth-testing
git merge main
```

## .gitignore File

A basic `.gitignore` file for React projects is included in the repository. It prevents files like `node_modules`, build outputs, and environment configuration from being committed.