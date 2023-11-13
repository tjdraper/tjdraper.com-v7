# Function for putting git branch in prompt
function parse_git_branch
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/';
end

# The prompt
function fish_prompt
    set hn tjdraper.com-v7-staging;
    echo (set_color Green --bold)"$USER"@"$hn": (set_color cyan --bold)(pwd) (set_color blue --bold)(parse_git_branch);
    echo (set_color green)➜" " (set_color normal);
end

