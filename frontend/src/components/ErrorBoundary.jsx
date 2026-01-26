import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold text-red-600">Ocorreu um erro ao carregar o formulário</h2>
          <p className="text-sm text-gray-600 mt-2">Tente recarregar a página ou contate o suporte.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
