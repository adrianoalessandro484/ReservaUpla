namespace ReservaUPLA.Application.Common.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class BusinessRuleException : AppException
{
    public BusinessRuleException(string message) : base(message, 400)
    {
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404)
    {
    }
}
