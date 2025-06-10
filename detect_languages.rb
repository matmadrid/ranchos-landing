require 'linguist'
require 'find'

language_stats = Hash.new(0)
total_bytes = 0

Find.find('.') do |path|
  next unless File.file?(path)
  blob = Linguist::FileBlob.new(path)
  language = blob.language
  next unless language
  size = File.size(path)
  language_stats[language.name] += size
  total_bytes += size
end

puts "Language usage by file size:"
language_stats.sort_by { |_, size| -size }.each do |lang, size|
  percent = (size.to_f / total_bytes * 100).round(2)
  puts "#{lang}: #{percent}%"
end
