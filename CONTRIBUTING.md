# Contributing to Philosophical Toys

Thank you for your interest in contributing to Philosophical Toys! This document provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see README.md)
4. Create a new branch for your feature or bugfix

## Development Workflow

### Before You Start

- Check existing issues and pull requests to avoid duplication
- For major changes, consider opening an issue first to discuss
- Ensure you have the latest changes from the main branch

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards below
3. Test your changes thoroughly
4. Commit your changes with descriptive messages

### Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Use Prettier and ESLint (run `npm run lint`)
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic
- **Testing**: Add tests for new functionality

### Component Guidelines

- **React Components**: Use functional components with hooks
- **Props**: Define clear TypeScript interfaces for props
- **Performance**: Consider React.memo for expensive renders
- **Accessibility**: Ensure components are accessible

### 3D Graphics (Three.js)

- **Performance**: Optimize geometry and materials
- **Memory**: Dispose of resources properly
- **Compatibility**: Test on different devices and browsers

### Audio (P5.js/Tone.js)

- **User Interaction**: Respect browser autoplay policies
- **Performance**: Use efficient audio processing
- **Accessibility**: Provide controls for audio features

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add new phenakistoscope animation patterns
fix: resolve zoetrope texture loading issue
docs: update installation instructions
style: improve component spacing and typography
refactor: optimize particle system performance
test: add unit tests for timeline component
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Ensure code passes linting: `npm run lint`
5. Update CHANGELOG.md with your changes
6. Submit your pull request

### Pull Request Template

- **Description**: Clear description of what the PR does
- **Type**: Feature, bugfix, documentation, etc.
- **Testing**: How you tested your changes
- **Screenshots**: For UI changes, include before/after images
- **Breaking Changes**: Note any breaking changes

## Reporting Issues

When reporting bugs:

- Use a clear, descriptive title
- Describe the expected vs actual behavior
- Include steps to reproduce
- Mention your browser, OS, and device type
- Include console errors if applicable

For feature requests:

- Explain the use case and benefits
- Consider providing mockups for UI features
- Discuss implementation approach if applicable

## Development Environment

### Required Tools

- Node.js 18+ 
- npm or yarn
- Git
- Modern browser with WebGL support

### Optional Tools

- VS Code with recommended extensions
- Browser developer tools
- Graphics editing software (for textures/images)

## Project Structure

Understanding the codebase:

- `/src/app/` - Next.js pages and routing
- `/src/components/` - React components
- `/src/lib/` - Utilities and configuration
- `/public/` - Static assets
- `/src/types/` - TypeScript definitions

## Historical Accuracy

When contributing to the historical aspects:

- Research historical sources
- Maintain period-appropriate visuals
- Include educational value
- Cite sources when possible

## Performance Considerations

- **3D Models**: Keep polygon counts reasonable
- **Textures**: Optimize image sizes and formats
- **Animations**: Use requestAnimationFrame appropriately
- **Memory**: Clean up WebGL resources

## Questions?

Feel free to:

- Open an issue for questions
- Join discussions in existing issues
- Review other pull requests

Thank you for contributing to Philosophical Toys! 