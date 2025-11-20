# frozen_string_literal: true

ISBN_10 = 10
ISBN_13 = 13

VALID_RESULT = 'valid'
INVALID_RESULT = 'invalid'

input = gets.chomp

input_length = input.length

if input_length == ISBN_10
  puts validate_isbn_10(input)
elsif input_length == ISBN_13
  puts validate_isbn_13(input)
else
  puts INVALID_RESULT
end

def validate_isbn_10(isbn)
  return INVALID_RESULT unless isbn.slice(0,3) == '978' || isbn.slice(0,3) == '979'

  sum = 0
  isbn.chars.each_with_index do |char, index|
    if char == 'X' && index == 9
      sum += 10 * (index + 1)
    elsif char =~ /\d/
      sum += char.to_i * (index + 1)
    else
      return INVALID_RESULT
    end
  end
  sum % 11 == 0 ? VALID_RESULT : INVALID_RESULT
end

def validate_isbn_13(isbn)
  sum = 0
  isbn.chars.each_with_index do |char, index|
    return INVALID_RESULT unless char =~ /\d/

    multiplier = index.even? ? 1 : 3
    sum += char.to_i * multiplier
  end
  sum % 10 == 0 ? VALID_RESULT : INVALID_RESULT
end
